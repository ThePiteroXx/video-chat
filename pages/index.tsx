import { useState, useRef } from 'react';
import { useExitIntent } from 'use-exit-intent';
import { v4 as uuidv4 } from 'uuid';
import { RtmChannel } from 'agora-rtm-sdk';

import { Room, Message } from '@/types/roomApi';
import { connectToAgoraRtm } from '@/utils/agora';

// import styles from '../styles/Home.module.css';

const leaveRoom = async (room: Room) => {
  if (room.status === 'chatting') {
    await fetch(`/api/room/${room._id}`, {
      method: 'PUT',
    });
    return;
  }

  await fetch(`/api/room/${room._id}`, {
    method: 'DELETE',
  });
};

const userId = uuidv4();
let clientChannel: RtmChannel | undefined;

const Home = () => {
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { registerHandler } = useExitIntent({
    desktop: {
      triggerOnMouseLeave: false,
      useBeforeUnload: true,
    },
  });
  registerHandler({
    id: 'leaveRoom',
    handler: () => {
      if (!room) return;
      leaveRoom(room);
    },
  });

  const getRoom = async () => {
    const room: Room = await fetch(`/api/room?userId=${userId}`).then((res) => res.json());
    const { channel } = await connectToAgoraRtm(
      room._id,
      userId,
      (message) => setMessages((curr) => [...curr, message]),
      room.rtmToken
    );
    clientChannel = channel;
    setRoom(room);
  };

  const nextRoom = async () => {
    console.log(room?.status);
    switch (room?.status) {
      case 'chatting':
        const prevRoom = room;
        await getRoom();
        leaveRoom(prevRoom);
        break;
      case 'waiting':
        await leaveRoom(room);
        getRoom();
        break;
    }
    setMessages([]);
  };

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (!inputRef.current?.value) return;
    const value = inputRef.current.value;

    await clientChannel?.sendMessage({ text: value });
    setMessages((curr) => [...curr, { userId, message: value }]);
    inputRef.current.value = '';
  };

  return (
    <div>
      {!room && <button onClick={getRoom}>Start chatting</button>}
      {room && (
        <>
          <button onClick={nextRoom}>next</button>
          <ul>
            {messages.map(({ message, userId: id }, index) => (
              <li key={index}>
                {id === userId ? 'You: ' : 'Stranger: '}
                {message}
              </li>
            ))}
          </ul>
          <form onSubmit={onSubmit}>
            <input ref={inputRef} />
            <button>submit</button>
          </form>
        </>
      )}
      <p>{room?._id}</p>
    </div>
  );
};

export default Home;
