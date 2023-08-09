import { ICameraVideoTrack, IRemoteVideoTrack } from 'agora-rtc-sdk-ng';

import VideoPlayer from './VideoPlayer/VideoPlayer';

interface VideoPannelProps {
  memberTrack?: IRemoteVideoTrack;
  myVideoTrack: ICameraVideoTrack;
}

const PannelVideo = ({ memberTrack, myVideoTrack }: VideoPannelProps) => {
  return (
    <div>
      {memberTrack && (
        <VideoPlayer videoTrack={memberTrack} style={{ width: '300px', height: '300px' }} />
      )}
      {myVideoTrack && (
        <VideoPlayer videoTrack={myVideoTrack} style={{ width: '300px', height: '300px' }} />
      )}
    </div>
  );
};

export default PannelVideo;
