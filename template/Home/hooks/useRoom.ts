import { useState, useRef, useEffect } from 'react';
import AgoraRTC, {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IRemoteVideoTrack,
} from 'agora-rtc-sdk-ng';
import { RtmChannel } from 'agora-rtm-sdk';

import { Room } from '@/types/roomApi';
import { connectToAgoraRtm } from '@/utils/agora';

import { leaveRoom } from '../helpers';

export const useRoom = (userId: string, rtcClient: IAgoraRTCClient) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [memberVideo, setMemberVideo] = useState<IRemoteVideoTrack>();
  const [myVideo, setMyVideo] = useState<ICameraVideoTrack>();

  const chatChannel = useRef<RtmChannel>();
  const myVideoTrack = useRef<[IMicrophoneAudioTrack, ICameraVideoTrack]>();

  const connectToRoom = async () => {
    room && rtcClient.leave();
    setIsConnecting(true);

    if (!myVideoTrack.current) {
      myVideoTrack.current = await AgoraRTC.createMicrophoneAndCameraTracks();
      setMyVideo(myVideoTrack.current[1]);
    }

    const newRoom: Room = await fetch(`/api/room/connect`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }).then((res) => res.json());

    const [{ channel }] = await Promise.all([
      connectToAgoraRtm(newRoom._id, userId, newRoom.rtmToken!),
      rtcClient.join(process.env.NEXT_PUBLIC_AGORA_APP_ID!, newRoom._id, newRoom.rtcToken!, userId),
    ]);

    await rtcClient.publish(myVideoTrack.current);

    chatChannel.current = channel;

    setRoom(newRoom);
    setIsConnecting(false);
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
  }, [rtcClient]);

  // listen when user join to the chat
  useEffect(() => {
    if (!chatChannel.current || !room) return;

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
      chatChannel.current?.leave();
      setMemberVideo(undefined);
      setRoom(null);
    };

    window.addEventListener('beforeunload', handleExitIntent);
    chatChannel.current.on('MemberJoined', onMemberJoin);
    chatChannel.current.on('MemberLeft', onMemberLeft);

    return () => {
      window.removeEventListener('beforeunload', handleExitIntent);
      chatChannel.current?.off('MemberJoined', onMemberJoin);
      chatChannel.current?.off('MemberLeft', onMemberLeft);
    };
  }, [room, rtcClient]);

  return {
    room,
    isConnecting,
    myVideo,
    memberVideo,
    connectToRoom,
    chatChannel: chatChannel.current,
  };
};
