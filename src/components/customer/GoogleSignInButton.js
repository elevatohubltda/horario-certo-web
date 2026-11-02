import { useEffect, useRef } from "react";
import { isMobileApp } from "../../services/api";

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const SCRIPT_SRC = "https://accounts.google.com/gsi/client";

// Sem REACT_APP_GOOGLE_CLIENT_ID configurado, o botão do Google não aparece. Dentro do app (WebView)
// também não: o Google bloqueia login em navegador embutido (erro 403 disallowed_useragent).
export const googleSignInEnabled = Boolean(CLIENT_ID) && !isMobileApp();

let scriptPromise = null;
const loadScript = () => {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error("Falha ao carregar o login com Google"));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
};

// Botão oficial "Continuar com o Google"; entrega o ID token para o backend validar
export default function GoogleSignInButton({ onCredential }) {
  const containerRef = useRef(null);
  const callbackRef = useRef(onCredential);
  callbackRef.current = onCredential;

  useEffect(() => {
    if (!googleSignInEnabled) return undefined;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !containerRef.current) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (response) => callbackRef.current?.(response.credential),
        });
        const width = Math.min(400, Math.max(200, containerRef.current.offsetWidth || 320));
        window.google.accounts.id.renderButton(containerRef.current, {
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          locale: "pt-BR",
          width,
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!googleSignInEnabled) return null;
  return <div ref={containerRef} style={{ width: "100%", display: "flex", justifyContent: "center", minHeight: 44 }} />;
}
