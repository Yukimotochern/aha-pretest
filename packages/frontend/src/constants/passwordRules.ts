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
