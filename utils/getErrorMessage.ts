export const getErrorMessage = (err: unknown) => {
  let message = 'Unknown Error';
  if (err instanceof Error) message = err.message;

  return message;
};
