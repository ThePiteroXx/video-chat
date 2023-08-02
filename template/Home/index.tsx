import { useState, useEffect } from 'react';
import { useExitIntent } from 'use-exit-intent';
import { v4 as uuidv4 } from 'uuid';
import { RtmChannel } from 'agora-rtm-sdk';

import { Room } from '@/types/roomApi';
import { connectToAgoraRtm } from '@/utils/agora';

import PannelChat from './PannelChat/PannelChat';
import { leaveRoom } from './helpers';
// import styles from '../styles/Home.module.css';

const userId = uuidv4();
let clientChannel: RtmChannel | undefined;

const Home = () => {
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

  const connectToRoom = async () => {
    const room: Room = await fetch(`/api/room/connect`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }).then((res) => res.json());

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { channel } = await connectToAgoraRtm(room._id, userId, room.rtmToken!);
    clientChannel = channel;

    setRoom(room);
  };

  useEffect(() => {
    if (!clientChannel || !room) return;

    const onMemberJoin = () => {
      setRoom((prev) => ({ ...prev, status: 'chatting' } as Room));
    };

    const onMemberLeft = () => {
      setRoom((prev) => ({ ...prev, status: 'waiting' } as Room));
    };

    clientChannel.on('MemberJoined', onMemberJoin);
    clientChannel.on('MemberLeft', onMemberLeft);

    return () => {
      clientChannel?.off('MemberJoined', onMemberJoin);
      clientChannel?.off('MemberLeft', onMemberLeft);
    };
  }, [room]);

  return (
    <div>
      {!room && <button onClick={connectToRoom}>Start chatting</button>}
      {room && clientChannel && (
        <PannelChat
          userId={userId}
          room={room}
          clientChannel={clientChannel}
          connectToRoom={connectToRoom}
        />
      )}
      <p>{room?._id}</p>
    </div>
  );
};

export default Home;
