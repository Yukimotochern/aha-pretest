import { Spin } from 'antd';

export const AppLoading = () => {
  return (
    <div>
      <Spin
        size="large"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />
    </div>
  );
};
