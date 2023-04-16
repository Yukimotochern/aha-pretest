import { useState, useCallback } from 'react';
import { Form, Input, Button, FormInstance, FormItemProps } from 'antd';

import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  passwordSignup,
  passwordLogin,
  AuthFlows,
  EmailPasswordFormValues,
} from '../../redux/auth.slice';
import { emailRules } from '../../constants/emailRule';
import { passwordRules } from '../../constants/passwordRules';

interface EmailPasswordFormProps {
  form: FormInstance<EmailPasswordFormValues>;
  authFlow: AuthFlows;
  className?: string;
}

export const EmailPasswordForm = ({
  form,
  authFlow,
  className,
}: EmailPasswordFormProps) => {
  const isAuthLoading = useAppSelector((state) => state.auth.loading);
  const dispatch = useAppDispatch();
  const [submitError, setSubmitError] = useState('');
  const clearSubmitError = useCallback(() => setSubmitError(''), []);

  const submitErrorSetting: Pick<FormItemProps, 'validateStatus' | 'help'> =
    submitError
      ? {
          validateStatus: 'error',
          help: submitError,
        }
      : {};

  const handleContinue = useCallback(() => {
    const submitRequest = {
      data: { ...form.getFieldsValue() },
      setSubmitError,
    };
    if (authFlow === 'login') {
      dispatch(passwordLogin(submitRequest));
    } else {
      dispatch(passwordSignup(submitRequest));
    }
  }, [authFlow, dispatch, form]);

  return (
    <Form form={form} onFinish={handleContinue} className={className}>
      <Form.Item name="email" {...submitErrorSetting} rules={emailRules}>
        <Input
          id={`email-${authFlow}`}
          placeholder="Email address"
          onChange={clearSubmitError}
          disabled={isAuthLoading}
        />
      </Form.Item>
      <Form.Item
        name="password"
        {...submitErrorSetting}
        rules={authFlow === 'login' ? undefined : passwordRules}
      >
        <Input.Password
          id={`password-${authFlow}`}
          placeholder="Password"
          onChange={clearSubmitError}
          disabled={isAuthLoading}
        />
      </Form.Item>
      <Form.Item className="mb-1">
        <Button type="primary" htmlType="submit" block loading={isAuthLoading}>
          Continue
        </Button>
      </Form.Item>
    </Form>
  );
};
