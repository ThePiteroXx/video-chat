import { useEffect, useRef } from 'react';
import type { IRemoteVideoTrack, ICameraVideoTrack } from 'agora-rtc-sdk-ng';

const VideoPlayer = ({
  videoTrack,
  style,
}: {
  videoTrack: IRemoteVideoTrack | ICameraVideoTrack;
  style?: object;
}) => {
  const ref = useRef(null);

  useEffect(() => {
    const playerRef = ref.current;
    if (!videoTrack) return;
    if (!playerRef) return;

    videoTrack.play(playerRef);

    return () => {
      videoTrack.stop();
    };
  }, [videoTrack]);

  return <div ref={ref} style={style}></div>;
};

export default VideoPlayer;
