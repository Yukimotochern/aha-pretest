import { Button, ButtonProps } from 'antd';
import { useAppSelector } from '../redux/hooks';

interface SocialButtonProps {
  onClick: ButtonProps['onClick'];
  imgSrc: string;
  name: string;
}

export const SocialButton = ({ onClick, imgSrc, name }: SocialButtonProps) => {
  const isAuthLoading = useAppSelector((state) => state.auth.loading);
  return (
    <Button
      className="mt-3 mb-2 text-left"
      type="default"
      block
      onClick={onClick}
      disabled={isAuthLoading}
    >
      <img
        className="mr-2 mb-[0.27rem] inline h-2/3 border-r-2 object-contain"
        src={imgSrc}
        alt={`${name} Logo`}
      />
      Continue with {name}
    </Button>
  );
};
