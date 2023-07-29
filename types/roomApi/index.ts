type ResponseError = {
  errorName: 'unknown' | 'no_method';
  message?: string;
};

export type Room = {
  _id: string;
  status: 'waiting' | 'chatting';
  rtmToken: string;
};

export type ResponseData = Room | ResponseError | string;

export type Message = {
  userId: string;
  message: string;
};
