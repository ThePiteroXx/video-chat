import { ICameraVideoTrack, IRemoteVideoTrack } from 'agora-rtc-sdk-ng';

import VideoPlayer from './VideoPlayer/VideoPlayer';

import styles from './PannelVideo.module.css';

interface VideoPannelProps {
  memberTrack?: IRemoteVideoTrack;
  myVideoTrack?: ICameraVideoTrack;
}

const PannelVideo = ({ memberTrack, myVideoTrack }: VideoPannelProps) => {
  return (
    <div className={styles.wrapper}>
      {myVideoTrack ? (
        <VideoPlayer videoTrack={myVideoTrack} />
      ) : (
        <div className={`${styles.video}`} style={{ backgroundColor: 'black' }} />
      )}
      {memberTrack ? (
        <VideoPlayer videoTrack={memberTrack} />
      ) : (
        <div className={`${styles.video} ${styles.placeholder}`} />
      )}
    </div>
  );
};

export default PannelVideo;
