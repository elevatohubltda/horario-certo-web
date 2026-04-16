import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import MyAppointments from './pages/MyAppointments';
import Config from './pages/Config';
import ChangePassword from './pages/ChangePassword';
import Register from './pages/Register';
import MySchedule from './pages/MySchedule';
import './global.css';
import Payment from './pages/Payment';
import ChangeSubscription from './pages/ChangeSubscription';
import Services from './pages/Services';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Landing />,
    },
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '/esqueci-senha',
      element: <ForgotPassword />,
    },
    {
      path: '/:companyUrl',
      element: <Home />,
    },
    {
      path: '/dashboard',
      element: <Dashboard />,
    },
    {
      path: '/agendamentos',
      element: <MyAppointments />,
    },
    {
      path: '/configuracoes',
      element: <Config />,
    },
    {
      path: '/alterar-senha',
      element: <ChangePassword />,
    },
    {
      path: '/registro',
      element: <Register />,
    },
    {
      path: '/criar-agendamentos',
      element: <MySchedule />,
    },
    {
      path: '/assinatura',
      element: <Payment />,
    },
    {
      path: '/mudar-assinatura',
      element: <ChangeSubscription />,
    },
    {
      path: '/servicos',
      element: <Services />,
    },
    {
      path: '/analytics',
      element: <Analytics />,
    },
    {
      path: '/relatorios',
      element: <Reports />,
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
      v7_startTransition: true,
    },
  }
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<RouterProvider router={router} />);