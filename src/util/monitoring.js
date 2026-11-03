import * as Sentry from "@sentry/react";

// Registro de erros do site (e do app, que abre o site no WebView).
// Sem REACT_APP_SENTRY_DSN (ambiente local e testes) nada é enviado.
export function initMonitoring() {
  const dsn = process.env.REACT_APP_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: process.env.REACT_APP_SENTRY_ENVIRONMENT || "production",
    // LGPD: sem IP, cookies ou dados do usuário junto com o erro
    sendDefaultPii: false,
    // Só erros; sem medição de desempenho nem gravação de sessão (cabe no plano gratuito)
    tracesSampleRate: 0,
    ignoreErrors: [
      // Ruído comum de navegador/extensões, sem relação com o sistema
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed with undelivered notifications",
      "Non-Error promise rejection captured",
    ],
  });
}

export const ErrorBoundary = Sentry.ErrorBoundary;
