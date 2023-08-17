import { useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import AgoraRTC from 'agora-rtc-sdk-ng';

import PannelChat from './PannelChat/PannelChat';
import PannelVideo from './PannelVideo/PannelVideo';
import { useRoom } from './hooks/useRoom';
import { ChatHandle } from './PannelChat/PannelChat';
import { leaveRoom } from './helpers';

import styles from './index.module.css';

const rtcClient = AgoraRTC.createClient({
  mode: 'rtc',
  codec: 'vp8',
});
const userId = uuidv4();

const Home = () => {
  const { room, myVideo, isConnecting, memberVideo, chatChannel, connectToRoom } = useRoom(
    userId,
    rtcClient
  );
  const chatRef = useRef<ChatHandle>(null);

  const nextRoom = async () => {
    chatRef.current?.resetMessages();

    switch (room?.status) {
      case 'chatting':
        const prevRoom = room;
        await connectToRoom();
        leaveRoom(prevRoom);
        break;
      case 'waiting':
        await leaveRoom(room);
        connectToRoom();
        break;
    }
  };

  const reconnect = () => {
    if (isConnecting) return;
    chatRef.current?.resetMessages();
    connectToRoom();
  };

  if (!myVideo)
    return (
      <div className={styles['initial-screen']}>
        <button onClick={connectToRoom} className={styles.btn}>
          Start chatting
        </button>
      </div>
    );

  return (
    <div className={styles.main}>
      <div className={styles.container}>
        <PannelVideo memberTrack={memberVideo} myVideoTrack={myVideo} />
        <div className={styles.chat}>
          {room ? (
            <button onClick={nextRoom} className={styles.btn}>
              next
            </button>
          ) : (
            <button onClick={reconnect} className={styles.btn}>
              {isConnecting ? 'connecting...' : 'reconnect'}
            </button>
          )}
          <PannelChat userId={userId} room={room} clientChannel={chatChannel} ref={chatRef} />
        </div>
      </div>
      {/* <p>{room?._id}</p> */}
    </div>
  );
};

export default Home;
