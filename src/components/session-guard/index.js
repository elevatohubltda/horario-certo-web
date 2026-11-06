import { useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { isAvailableLogin, isPanelPath, redirectToLogin } from "../../util/auth";

/**
 * Envolve todas as rotas. Nas telas do painel, com a sessão vencida:
 * - ao abrir/navegar: não renderiza a tela e leva ao login;
 * - em qualquer ação (clique, toque, tecla) ou ao voltar para a aba: bloqueia a ação e leva ao login.
 * As chamadas à API com a sessão vencida são barradas no interceptor (util/auth.js).
 */
export default function SessionGuard() {
  const location = useLocation();
  const navigate = useNavigate();
  const current = location.pathname + location.search;
  const currentRef = useRef(current);
  currentRef.current = current;
  const blocked = isPanelPath(location.pathname) && !isAvailableLogin();

  useEffect(() => {
    if (blocked) redirectToLogin(navigate, current);
  }, [blocked, current, navigate]);

  useEffect(() => {
    const expired = () => isPanelPath(currentRef.current.split("?")[0]) && !isAvailableLogin();

    const onAction = (event) => {
      if (!expired()) return;
      event.preventDefault();
      event.stopPropagation();
      redirectToLogin(navigate, currentRef.current);
    };
    const onReturn = () => {
      if (document.visibilityState === "visible" && expired()) redirectToLogin(navigate, currentRef.current);
    };

    document.addEventListener("pointerdown", onAction, true);
    document.addEventListener("keydown", onAction, true);
    document.addEventListener("visibilitychange", onReturn);
    window.addEventListener("focus", onReturn);
    return () => {
      document.removeEventListener("pointerdown", onAction, true);
      document.removeEventListener("keydown", onAction, true);
      document.removeEventListener("visibilitychange", onReturn);
      window.removeEventListener("focus", onReturn);
    };
  }, [navigate]);

  return blocked ? null : <Outlet />;
}
