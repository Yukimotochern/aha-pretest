import { useState } from 'react';
import { LockOutlined } from '@ant-design/icons';
import { Button, Form, Input, FormItemProps } from 'antd';
import {
  confirmPasswordRules,
  passwordRules,
} from '../../constants/passwordRules';
import { trpc } from '../../trpc/client';
import { handleError } from '../../trpc/handleError';
import { apiErrorMsg, getMessageApi } from '../../utils/message';

export interface ChangePasswordFormValues {
  oldPassword: string;
  password: string;
}

export const ResetPassword = () => {
  const [form] = Form.useForm<ChangePasswordFormValues>();
  const [loading, setIsLoading] = useState(false);
  const [oldPasswordError, setOldPassword] = useState<
    Pick<FormItemProps, 'validateStatus' | 'help'>
  >({});

  const handleChangePassword = async () => {
    const { oldPassword, password } = form.getFieldsValue();
    setIsLoading(true);
    setOldPassword({});
    try {
      await trpc.auth.changePassword.mutate({
        oldPassword,
        newPassword: password,
      });
      getMessageApi().success('Password Changed Successfully.');
      form.resetFields();
    } catch (err) {
      handleError(err)
        .onStatusLayerError('auth.changePassword', '403', (err) =>
          setOldPassword({
            validateStatus: 'error',
            help: 'Incorrect Password.',
          })
        )
        .onStatusLayerError('auth.changePassword', '403', () => {
          getMessageApi().warning(
            'You are not using email to register. Change password functionality are available to those not registered with email. Something might went wrong. Please reload the page.'
          );
        })
        .onOtherCondition(apiErrorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form
      form={form}
      disabled={loading}
      onFinish={handleChangePassword}
      className="mx-28 my-10"
      size="small"
    >
      <Form.Item
        {...oldPasswordError}
        name="oldPassword"
        rules={[{ required: true, message: 'Please enter your password.' }]}
      >
        <Input
          type="password"
          prefix={<LockOutlined />}
          placeholder="Enter the current password."
        />
      </Form.Item>
      <Form.Item name="password" rules={passwordRules}>
        <Input
          type="password"
          prefix={<LockOutlined />}
          placeholder="Enter a new password."
        />
      </Form.Item>
      <Form.Item
        name="confirmNewPassword"
        rules={confirmPasswordRules}
        dependencies={['password']}
      >
        <Input
          type="password"
          prefix={<LockOutlined />}
          placeholder="Confirm your new password"
        />
      </Form.Item>
      <Form.Item>
        <Button loading={loading} type="primary" htmlType="submit" block>
          Reset Password
        </Button>
      </Form.Item>
    </Form>
  );
};
