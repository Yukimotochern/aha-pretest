import emailValidator from 'email-validator';
import { FormItemProps } from 'antd';

export const emailRules: FormItemProps['rules'] = [
  {
    validator: async (_, value: unknown) => {
      if (typeof value !== 'string' || !emailValidator.validate(value))
        throw new Error('Please enter a valid email.');
    },
  },
];
