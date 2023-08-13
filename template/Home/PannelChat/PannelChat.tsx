import { useState, useRef, useEffect } from 'react';

import { Room, Message } from '@/types/roomApi';

import { leaveRoom } from '../helpers';
import { RtmChannel, RtmMessage } from 'agora-rtm-sdk';

interface PannelChatProps {
  userId: string;
  room: Room | null;
  clientChannel?: RtmChannel;
  connectToRoom: () => Promise<void>;
}

const PannelChat = ({ userId, room, clientChannel, connectToRoom }: PannelChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const nextRoom = async () => {
    setMessages([]);
    switch (room?.status) {
      case 'chatting':
        const prevRoom = room;
        await connectToRoom();
        leaveRoom(prevRoom);
        break;
      case 'waiting':
        await leaveRoom(room);
        connectToRoom();
        break;
    }
  };

  const reconnect = () => {
    setMessages([]);
    connectToRoom();
  };

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (!inputRef.current?.value || !clientChannel) return;
    const value = inputRef.current.value;

    await clientChannel.sendMessage({ text: value });
    setMessages((prev) => [...prev, { userId, message: value }]);
    inputRef.current.value = '';
  };

  useEffect(() => {
    if (!clientChannel) return;

    const onMessage = (message: RtmMessage, userId: string) => {
      if (!message.text) return;
      setMessages((prev) => [...prev, { userId, message: message.text }]);
    };
    clientChannel.on('ChannelMessage', onMessage);

    return () => {
      clientChannel.off('ChannelMessage', onMessage);
    };
  }, [clientChannel]);

  return (
    <>
      {room ? (
        <button onClick={nextRoom}>next</button>
      ) : (
        <button onClick={reconnect}>reconnect</button>
      )}
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
        <button disabled={!!!room}>submit</button>
      </form>
    </>
  );
};

export default PannelChat;
