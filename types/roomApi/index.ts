type ResponseError = {
  errorName: 'unknown' | 'no_method';
  message?: string;
};

export type Room = {
  _id: string;
  status: 'waiting' | 'chatting';
};

export type ResponseData = Room | ResponseError | string;
