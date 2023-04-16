import { Outlet } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <div className="item-center flex flex-col justify-between sm:min-h-screen sm:flex-row">
      <div className="bg-[url('https://account.mongodb.com/static/images/auth/login_promo_mobile.png')] bg-cover bg-top bg-no-repeat py-3 px-3 text-center text-xl text-slate-200 underline underline-offset-4 sm:hidden">
        Header
      </div>
      <div className="flex flex-col justify-center py-2 px-24 sm:w-[490px] sm:p-24">
        <Outlet />
      </div>
      <div className="hidden flex-1 sm:block">
        <div className="min-h-[12rem] bg-[url('https://account.mongodb.com/static/images/auth/login_promo_desktop.png')] bg-cover bg-center bg-no-repeat sm:sticky sm:top-0 sm:h-screen"></div>
      </div>
    </div>
  );
};
