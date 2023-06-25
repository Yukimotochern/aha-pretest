import { Divider } from 'antd';
import { Profile } from './Profile';
import { ResetPassword } from './ResetPassword';
import { UserDatabase } from './UserDatabase';
import { useAppSelector } from '../../redux/hooks';

export const DashboardPage = () => {
  const isEmailPasswordMethod = useAppSelector((state) =>
    state.auth.sub.includes('auth0')
  );

  return (
    <div>
      {/* Profile (name + log out) */}
      <Divider type="horizontal">Profile</Divider>
      <Profile />

      {/* Reset password */}
      {isEmailPasswordMethod && (
        <>
          <Divider type="horizontal">Reset Password</Divider>
          <ResetPassword />
        </>
      )}

      {/* User Database Dashboard */}
      <Divider type="horizontal">User Database</Divider>
      <UserDatabase />
    </div>
  );
};
