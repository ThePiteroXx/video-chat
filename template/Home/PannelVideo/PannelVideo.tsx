import {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IRemoteVideoTrack,
} from 'agora-rtc-sdk-ng';

import VideoPlayer from './VideoPlayer/VideoPlayer';
import { useEffect, useState } from 'react';

interface VideoPannelProps {
  rtcClient: IAgoraRTCClient;
  myVideoTrack: [IMicrophoneAudioTrack, ICameraVideoTrack];
}

const PannelVideo = ({ rtcClient, myVideoTrack }: VideoPannelProps) => {
  const [memberVideo, setMemberVideo] = useState<IRemoteVideoTrack>();

  useEffect(() => {
    const onMemberJoin = async (member: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
      await rtcClient.subscribe(member, mediaType);
      console.log(member);
      if (mediaType === 'video') {
        setMemberVideo(member.videoTrack);
      }

      if (mediaType === 'audio') {
        member.audioTrack?.play();
      }
    };

    rtcClient.on('user-published', onMemberJoin);
    return () => {
      rtcClient.off('user-published', onMemberJoin);
    };
  }, [rtcClient]);
  console.log(memberVideo);
  return (
    <div>
      {memberVideo && (
        <VideoPlayer videoTrack={memberVideo} style={{ width: '300px', height: '300px' }} />
      )}
      {myVideoTrack && (
        <VideoPlayer videoTrack={myVideoTrack[1]} style={{ width: '300px', height: '300px' }} />
      )}
    </div>
  );
};

export default PannelVideo;
