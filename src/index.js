import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import Landing from './pages/Landing';
import CustomerPanel from './pages/customer/CustomerPanel';
import CustomerAuth from './pages/customer/CustomerAuth';
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
import { ErrorBoundary, initMonitoring } from './util/monitoring';
import Payment from './pages/Payment';
import ChangeSubscription from './pages/ChangeSubscription';
import Services from './pages/Services';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import PushNotifications from './pages/PushNotifications';
import TermosDeUso from './pages/TermosDeUso';
import WaitingList from './pages/WaitingList';
import Help from './pages/Help';
import Divulgacao from './pages/Divulgacao';
import WeeklyScheduleConfig from './pages/WeeklyScheduleConfig';
import WeeklyCalendarView from './pages/WeeklyCalendarView';
import AdminWhatsAppUsage from './pages/AdminWhatsAppUsage';
import AdminClients from './pages/AdminClients';
import AdminPlans from './pages/AdminPlans';
import AdminDiscountCodes from './pages/AdminDiscountCodes';
import AdminPushMessages from './pages/AdminPushMessages';
import AdminInvoices from './pages/AdminInvoices';
import Professionals from './pages/Professionals';
import NotFound from './pages/NotFound';

const router = createBrowserRouter(
  [
    { path: '/',                  element: <Landing /> },
    { path: '/login',             element: <Login /> },
    { path: '/esqueci-senha',     element: <ForgotPassword /> },
    { path: '/registro',          element: <Register /> },
    { path: '/termos-de-uso',     element: <TermosDeUso /> },
    // Área do cliente final (hífen no caminho: o link de empresa só aceita letras e números)
    { path: '/area-do-cliente',   element: <CustomerPanel /> },
    { path: '/area-do-cliente/entrar', element: <CustomerAuth /> },
    { path: '/:companyUrl',       element: <Home /> },
    { path: '/dashboard',         element: <Dashboard /> },
    { path: '/agendamentos',      element: <MyAppointments /> },
    { path: '/configuracoes',     element: <Config /> },
    { path: '/alterar-senha',     element: <ChangePassword /> },
    { path: '/criar-agendamentos',element: <MySchedule /> },
    { path: '/assinatura',        element: <Payment /> },
    { path: '/mudar-assinatura',  element: <ChangeSubscription /> },
    { path: '/servicos',          element: <Services /> },
    { path: '/analytics',         element: <Analytics /> },
    { path: '/relatorios',        element: <Reports /> },
    { path: '/notificacoes',      element: <Notifications /> },
    { path: '/notificacoes-push', element: <PushNotifications /> },
    { path: '/lista-de-espera',   element: <WaitingList /> },
    { path: '/ajuda',             element: <Help /> },
    { path: '/divulgacao',        element: <Divulgacao /> },
    { path: '/configurar-horario-semanal', element: <WeeklyScheduleConfig /> },
    { path: '/agenda-semanal',    element: <WeeklyCalendarView /> },
    { path: '/profissionais',     element: <Professionals /> },
    { path: '/admin/whatsapp',    element: <AdminWhatsAppUsage /> },
    { path: '/admin/clientes',    element: <AdminClients /> },
    { path: '/admin/planos',      element: <AdminPlans /> },
    { path: '/admin/cupons',      element: <AdminDiscountCodes /> },
    { path: '/admin/notificacoes', element: <AdminPushMessages /> },
    { path: '/admin/notas-fiscais', element: <AdminInvoices /> },
    // Qualquer outro endereço (com mais de um trecho; os de um trecho caem em /:companyUrl)
    { path: '*',                  element: <NotFound /> },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
      v7_startTransition: true,
    },
  }
);

initMonitoring();

// Erro de tela não tratado: registra no Sentry e mostra uma saída em vez da página em branco
const CrashFallback = () => (
  <div style={{ maxWidth: 420, margin: '20vh auto', padding: '0 1rem', textAlign: 'center', fontFamily: 'var(--ui-font)' }}>
    <h2 style={{ color: 'var(--ui-text)' }}>Algo deu errado nesta tela</h2>
    <p style={{ color: 'var(--ui-muted)' }}>O problema já foi registrado. Recarregue a página para continuar.</p>
    <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
      Recarregar
    </button>
  </div>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary fallback={<CrashFallback />}>
    <RouterProvider router={router} />
  </ErrorBoundary>
);
