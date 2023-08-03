import { RtmTokenBuilder, RtmRole, RtcRole, RtcTokenBuilder } from 'agora-access-token';

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

const getRtcToken = (roomId: string, userId: string) => {
  const appID = process.env.NEXT_PUBLIC_AGORA_APP_ID!;
  const appCertificate = process.env.AGORA_APP_CERT!;
  const channelName = roomId;
  const account = userId;
  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  const token = RtcTokenBuilder.buildTokenWithAccount(
    appID,
    appCertificate,
    channelName,
    account,
    role,
    privilegeExpiredTs
  );

  return token;
};

const connectToAgoraRtm = async (roomId: string, userId: string, token: string) => {
  const AgoraRTM = (await import('agora-rtm-sdk')).default;
  const client = AgoraRTM.createInstance(process.env.NEXT_PUBLIC_AGORA_APP_ID!);
  await client.login({
    uid: userId,
    token,
  });
  const channel = client.createChannel(roomId);
  await channel.join();

  return {
    channel,
  };
};

const connectToAgoraRtc = async (roomId: string, userId: string, token: string) => {
  const { default: AgoraRTC } = await import('agora-rtc-sdk-ng');

  const client = AgoraRTC.createClient({
    mode: 'rtc',
    codec: 'vp8',
  });

  await client.join(process.env.NEXT_PUBLIC_AGORA_APP_ID!, roomId, token, userId);

  const tracks = await AgoraRTC.createMicrophoneAndCameraTracks();
  await client.publish(tracks);

  return { tracks, client };
};

export { getRtmToken, getRtcToken, connectToAgoraRtm, connectToAgoraRtc };
