import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Config from './pages/Config';
import ChangePassword from './pages/ChangePassword';
import Register from './pages/Register';
import MySchedule from './pages/MySchedule';
import './global.css';
import Payment from './pages/Payment';

const router = createBrowserRouter(
  [
    {
      path: '/',
      children: [
        { index: true, element: <Login /> },
        { path: ":companyUrl", element: <Home /> },
      ],
    },
    {
      path: '/dashboard',
      element: <Dashboard />,
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
      path: '/minha-assinatura',
      element: <Payment />,
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

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js")
      .then(() => console.log("Service Worker registrado"))
      .catch(err => console.error("SW erro:", err));
  });
}