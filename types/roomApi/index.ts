import type { ResponseError } from '../responseError';

export type Room = {
  _id: string;
  status: 'waiting' | 'chatting';
  rtmToken?: string;
  rtcToken?: string;
};

export type ResponseData = Room | ResponseError | string;

export type Message = {
  userId: string;
  message: string;
};
