/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { RtmTokenBuilder, RtmRole } from 'agora-access-token';

import type { Message } from '@/types/roomApi';

const getRtmToken = (userId: string) => {
  const appID = process.env.NEXT_PUBLIC_AGORA_APP_ID!;
  const appCertificate = process.env.AGORA_APP_CERT!;
  const account = userId;
  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
  const token = RtmTokenBuilder.buildToken(
    appID,
    appCertificate,
    account,
    RtmRole.Rtm_User,
    privilegeExpiredTs
  );
  return token;
};

const connectToAgoraRtm = async (
  roomId: string,
  userId: string,
  onMessage: (message: Message) => void,
  token: string
) => {
  const AgoraRTM = (await import('agora-rtm-sdk')).default;
  const client = AgoraRTM.createInstance(process.env.NEXT_PUBLIC_AGORA_APP_ID!);
  await client.login({
    uid: userId,
    token,
  });
  const channel = client.createChannel(roomId);
  await channel.join();

  channel.on('ChannelMessage', (message, userId) => {
    if (!message.text) return;
    onMessage({ userId, message: message.text });
  });

  return {
    channel,
  };
};

export { getRtmToken, connectToAgoraRtm };
