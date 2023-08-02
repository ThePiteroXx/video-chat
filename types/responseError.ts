export type ResponseError = {
  errorName: 'unknown' | 'no_method' | 'no_found';
  message?: string;
};
