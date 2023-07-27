import type { NextPage } from 'next';
import { useState } from 'react';
import { useExitIntent } from 'use-exit-intent';

// import styles from '../styles/Home.module.css';

type Room = {
  _id: string;
  status: 'waiting' | 'chatting';
};

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

const Home: NextPage = () => {
  const [room, setRoom] = useState<Room | null>(null);
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
    const room = await fetch('/api/room').then((res) => res.json());
    setRoom(room);
  };

  const nextRoom = async () => {
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
  };

  return (
    <div>
      {!room && <button onClick={getRoom}>Start chatting</button>}
      {room && <button onClick={nextRoom}>next</button>}
      <p>{room?._id}</p>
    </div>
  );
};

export default Home;
