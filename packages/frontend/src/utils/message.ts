import type { MessageInstance } from 'antd/es/message/interface';

let message: MessageInstance;

export const injectMessageApi = (_message: MessageInstance) => {
  message = _message;
};

export const getMessageApi = () => message;

export const apiErrorMsg = (
  msg = 'Something went wrong. Please try again latter.'
) => getMessageApi().error(msg);
