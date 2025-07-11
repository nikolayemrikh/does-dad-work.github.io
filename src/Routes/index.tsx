import { MainPage } from '@app/pages/MainPage';
import { FC } from 'react';
import { Route, Routes as RouterRoutes } from 'react-router-dom';
import { routes } from './routes';

export const Routes: FC = () => {
  return (
    <RouterRoutes>
      <Route path={routes.main} element={<MainPage />} />
    </RouterRoutes>
  );
};
