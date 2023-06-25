import { useEffect, useState } from 'react';
import { Button, ButtonProps, Input, InputProps, Spin, Space } from 'antd';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { appAuth0Logout } from '../../redux/auth.slice';
import { changeName, getProfile } from '../../redux/userProfile.slice';
import { EditOutlined } from '@ant-design/icons';

export const Profile = () => {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.userProfile.loading);
  const profile = useAppSelector((state) => state.userProfile.profile);
  const [nameInput, setNameInput] = useState(profile?.name || '');
  const [mode, setMode] = useState<'display' | 'edit'>('display');
  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  if (isLoading && !profile)
    return (
      <div>
        <Spin className="mx-auto" />;
      </div>
    );

  const handleNameInput: InputProps['onChange'] = (e) => {
    setNameInput(e.target.value);
  };

  const handleChangeName: ButtonProps['onClick'] = async () => {
    await dispatch(changeName(nameInput));
    setMode('display');
  };

  const handleToggleMode = () => {
    setMode((prev) => (prev === 'display' ? 'edit' : 'display'));
    setNameInput(profile?.name || '');
  };

  let Greeting: JSX.Element;

  if (mode === 'edit') {
    Greeting = (
      <Space direction="horizontal" className="text-lg">
        Hi,
        <Input
          size="small"
          value={nameInput}
          onChange={handleNameInput}
          placeholder="may I have your name?"
        />
        <Button
          type="primary"
          size="small"
          loading={isLoading}
          disabled={nameInput === profile?.name}
          onClick={handleChangeName}
        >
          Confirm
        </Button>
        <Button size="small" onClick={handleToggleMode} disabled={isLoading}>
          Cancel
        </Button>
      </Space>
    );
  } else {
    Greeting = (
      <div className="text-lg">
        Hi,{' '}
        {profile?.name ? (
          <span>
            {profile.name}
            <Button
              type="ghost"
              className="ml-1"
              size="small"
              icon={<EditOutlined />}
              shape="circle"
              onClick={handleToggleMode}
            />
          </span>
        ) : (
          <Button
            size="small"
            className="text-lg"
            type="dashed"
            onClick={handleToggleMode}
          >
            {' '}
            may I have you name?
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      {Greeting}
      <div className="mt-3 text-lg">
        {`Bye, ${profile?.name} ==> `}
        <Button
          size="small"
          type="dashed"
          onClick={() => dispatch(appAuth0Logout())}
        >
          {' '}
          log out{' '}
        </Button>
      </div>
    </>
  );
};
