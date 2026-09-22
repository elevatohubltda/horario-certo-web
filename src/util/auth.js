import { format } from 'date-fns';
import Cookies from "js-cookie";
import api, { isMobileApp } from "../services/api";

// Garante que todo cookie de sessão/empresa saia com as mesmas flags de
// segurança (secure + sameSite=Strict), evitando inconsistência entre telas.
export function setSecureCookie(name, value, options = {}) {
    Cookies.set(name, value, {
        secure: true,
        sameSite: "Strict",
        ...options,
    });
}

export function isAvailableLogin(){
    const now = format(new Date(), 'yyyy-MM-ddTHH:mm:ss');
    // No app mobile o token ainda é um cookie legível por JS; no navegador,
    // desde a migração para cookie httpOnly, o token não é mais acessível
    // aqui — quem decide "está logado" é a data de expiração que o backend
    // devolveu no login (o cookie httpOnly em si é validado pelo servidor
    // em cada chamada autenticada).
    if (isMobileApp() && !Cookies.get("token")) return false;
    const expirationDate = Cookies.get("expirationDate");
    if(!expirationDate) return false;
    if(now <= expirationDate) return true;
    clearSessionCookies();
    return false;
}

function clearSessionCookies(){
    Cookies.remove("token");
    Cookies.remove("expirationDate");
    Cookies.remove("companyInfo");
    Cookies.remove("companyProperties");
    Cookies.remove("companyFeatures");
}

export async function logout(){
    clearSessionCookies();
    try {
        // Limpa o cookie httpOnly no servidor. Não afeta o app mobile (que não
        // usa esse cookie para autenticar), mas é seguro chamar de qualquer forma.
        await api.post("/auth/logout", {}, { withCredentials: true });
    } catch (error) {
        console.error("Erro ao encerrar sessão no servidor:", error);
    }
}