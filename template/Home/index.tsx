import { v4 as uuidv4 } from 'uuid';
import AgoraRTC from 'agora-rtc-sdk-ng';

import PannelChat from './PannelChat/PannelChat';
import PannelVideo from './PannelVideo/PannelVideo';
import { useRoom } from './hooks/useRoom';
// import styles from '../styles/Home.module.css';

const rtcClient = AgoraRTC.createClient({
  mode: 'rtc',
  codec: 'vp8',
});
const userId = uuidv4();

const Home = () => {
  const { room, myVideo, memberVideo, chatChannel, connectToRoom } = useRoom(userId, rtcClient);

  if (!myVideo) return <button onClick={connectToRoom}>Start chatting</button>;

  return (
    <div>
      <>
        <PannelVideo memberTrack={memberVideo} myVideoTrack={myVideo} />
        <PannelChat
          userId={userId}
          room={room}
          clientChannel={chatChannel}
          connectToRoom={connectToRoom}
        />
      </>
      <p>{room?._id}</p>
    </div>
  );
};

export default Home;
