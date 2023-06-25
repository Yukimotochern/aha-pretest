import { FormItemProps } from 'antd';

export const passwordRules: FormItemProps['rules'] = [
  { required: true, message: 'Please enter a password.' },
  {
    min: 8,
    message: '* Password must be at least 8 characters.',
  },
  {
    pattern: /(?=.*[A-Z])/,
    message: '* Password must contain at least one upper case letter (A-Z.)',
  },
  {
    pattern: /(?=.*[a-z])/,
    message: '* Password must contain at least one lower case letter (a-z.)',
  },
  {
    pattern: /(?=.*\d)/,
    message: '* Password must contain at least one number (0-9.)',
  },
  {
    pattern: /(?=.*\W)/,
    message: '* Password must contain at least one special character.',
  },
];

export const confirmPasswordRules: FormItemProps['rules'] = [
  {
    required: true,
    message: 'Please confirm your password!',
  },
  ({ getFieldValue }) => ({
    validator(_, value) {
      if (!value || getFieldValue('password') === value) {
        return Promise.resolve();
      }
      return Promise.reject(
        new Error('The two passwords that you entered do not match!')
      );
    },
  }),
];
