import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { RtmChannel } from 'agora-rtm-sdk';
import { IMicrophoneAudioTrack, ICameraVideoTrack, IAgoraRTCClient } from 'agora-rtc-sdk-ng';

import { Room } from '@/types/roomApi';
import { connectToAgoraRtm, connectToAgoraRtc } from '@/utils/agora';

import PannelChat from './PannelChat/PannelChat';
import PannelVideo from './PannelVideo/PannelVideo';
import { leaveRoom } from './helpers';
// import styles from '../styles/Home.module.css';

const userId = uuidv4();
let clientChannel: RtmChannel | undefined;
let rtcClient: IAgoraRTCClient | undefined;
let rtcTracks: [IMicrophoneAudioTrack, ICameraVideoTrack] | undefined;

const Home = () => {
  const [room, setRoom] = useState<Room | null>(null);
  const isChatting = !!room && !!clientChannel && !!rtcClient && !!rtcTracks;

  const connectToRoom = async () => {
    const room: Room = await fetch(`/api/room/connect`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }).then((res) => res.json());

    const { channel } = await connectToAgoraRtm(room._id, userId, room.rtmToken!);
    const { tracks, client } = await connectToAgoraRtc(room._id, userId, room.rtcToken!);

    clientChannel = channel;
    rtcTracks = tracks;
    rtcClient = client;

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

    const handleExitIntent = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';

      leaveRoom(room);
      setRoom(null);
    };

    window.addEventListener('beforeunload', handleExitIntent);
    clientChannel.on('MemberJoined', onMemberJoin);
    clientChannel.on('MemberLeft', onMemberLeft);

    return () => {
      window.removeEventListener('beforeunload', handleExitIntent);
      clientChannel?.off('MemberJoined', onMemberJoin);
      clientChannel?.off('MemberLeft', onMemberLeft);
    };
  }, [room]);

  return (
    <div>
      {!room && <button onClick={connectToRoom}>Start chatting</button>}
      {isChatting && (
        <>
          <PannelVideo rtcClient={rtcClient!} myVideoTrack={rtcTracks!} />
          <PannelChat
            userId={userId}
            room={room}
            clientChannel={clientChannel!}
            connectToRoom={connectToRoom}
          />
        </>
      )}
      <p>{room?._id}</p>
    </div>
  );
};

export default Home;
