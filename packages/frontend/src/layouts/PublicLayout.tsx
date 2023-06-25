import { Outlet } from 'react-router-dom';

export const PublicLayout = () => {
  return (
    <div className="flex flex-col justify-between sm:min-h-screen sm:flex-row sm:items-start">
      <div className="bg-[url('https://account.mongodb.com/static/images/auth/login_promo_mobile.svg')] bg-cover bg-top bg-no-repeat py-3 px-3 text-center text-xl text-green-700 underline underline-offset-4 sm:hidden">
        Hello
      </div>
      <div className="flex flex-col justify-center py-6 px-24 sm:w-[490px] sm:p-24 sm:py-48">
        <Outlet />
      </div>
      <div className="hidden flex-1 sm:block">
        <div className="min-h-[12rem] bg-[url('https://account.mongodb.com/static/images/auth/login_promo_tablet.svg')] bg-cover bg-center bg-no-repeat sm:sticky sm:top-0 sm:h-screen"></div>
      </div>
    </div>
  );
};
