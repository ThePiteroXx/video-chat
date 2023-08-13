import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import AgoraRTC, {
  ICameraVideoTrack,
  IRemoteVideoTrack,
  IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng';

import { Room } from '@/types/roomApi';
import { connectToAgoraRtm } from '@/utils/agora';

import PannelChat from './PannelChat/PannelChat';
import PannelVideo from './PannelVideo/PannelVideo';
import { leaveRoom } from './helpers';
import { RtmChannel } from 'agora-rtm-sdk';
// import styles from '../styles/Home.module.css';

const rtcClient = AgoraRTC.createClient({
  mode: 'rtc',
  codec: 'vp8',
});

const userId = uuidv4();
let clientChannel: RtmChannel | undefined;
let myVideoTrack: [IMicrophoneAudioTrack, ICameraVideoTrack] | undefined;

const Home = () => {
  const [room, setRoom] = useState<Room | null>(null);
  const [memberVideo, setMemberVideo] = useState<IRemoteVideoTrack>();
  const [myVideo, setMyVideo] = useState<ICameraVideoTrack>();

  const connectToRoom = async () => {
    room && rtcClient.leave();

    if (!myVideoTrack) {
      myVideoTrack = await AgoraRTC.createMicrophoneAndCameraTracks();
      setMyVideo(myVideoTrack[1]);
    }

    const newRoom: Room = await fetch(`/api/room/connect`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }).then((res) => res.json());

    const [{ channel }] = await Promise.all([
      connectToAgoraRtm(newRoom._id, userId, newRoom.rtmToken!),
      rtcClient.join(process.env.NEXT_PUBLIC_AGORA_APP_ID!, newRoom._id, newRoom.rtcToken!, userId),
    ]);

    await rtcClient.publish(myVideoTrack);

    clientChannel = channel;

    setRoom(newRoom);
  };

  // listen when user join to room with video
  useEffect(() => {
    rtcClient.on('user-published', async (member, mediaType) => {
      await rtcClient.subscribe(member, mediaType);

      if (mediaType === 'video') {
        setMemberVideo(member.videoTrack);
      }

      if (mediaType === 'audio') {
        member.audioTrack?.play();
      }
    });

    rtcClient.on('user-unpublished', () => {
      setMemberVideo(undefined);
    });
  }, []);

  // listen when user join to the chat
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
      rtcClient.leave();
      clientChannel?.leave();
      setMemberVideo(undefined);
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
  console.log(room, myVideo);
  if (!myVideo) return <button onClick={connectToRoom}>Start chatting</button>;

  return (
    <div>
      <>
        <PannelVideo memberTrack={memberVideo} myVideoTrack={myVideo} />
        <PannelChat
          userId={userId}
          room={room}
          clientChannel={clientChannel}
          connectToRoom={connectToRoom}
        />
      </>
      <p>{room?._id}</p>
    </div>
  );
};

export default Home;
