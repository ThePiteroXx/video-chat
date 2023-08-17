import { useEffect, useRef } from 'react';
import type { IRemoteVideoTrack, ICameraVideoTrack } from 'agora-rtc-sdk-ng';

import styles from '../PannelVideo.module.css';

const VideoPlayer = ({ videoTrack }: { videoTrack: IRemoteVideoTrack | ICameraVideoTrack }) => {
  const ref = useRef(null);

  useEffect(() => {
    const playerRef = ref.current;
    if (!videoTrack || !playerRef) return;

    videoTrack.play(playerRef);

    return () => {
      videoTrack.stop();
    };
  }, [videoTrack]);

  return <div ref={ref} className={styles.video}></div>;
};

export default VideoPlayer;
