import { useState, useEffect } from 'react';
import { Button, Input } from 'antd';
import { trpc } from '../trpc/client';
export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [emailInput, setEmailInput] = useState('');
  useEffect(() => {
    trpc.user.get.query({}).then((val) => {
      setEmail(val.email);
    });
  }, []);
  return (
    <>
      <div>{email}</div>
      <Input
        value={emailInput}
        onChange={(e) => setEmailInput(e.target.value)}
      />
      <Button
        onClick={() => {
          trpc.user.post.mutate({
            email: emailInput,
          });
        }}
      >
        LoginPage
      </Button>
    </>
  );
};
