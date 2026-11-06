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
    // 'T' entre aspas: sem elas o date-fns troca o T pelo timestamp em milissegundos e a
    // comparação de texto abaixo nunca dava a sessão como vencida no mesmo dia
    const now = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss");
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

// Só controla o que o menu mostra; as permissões de admin são sempre checadas no backend
export function isAdmin(){
    return Cookies.get("userRole") === "ADMIN";
}

// Profissional da equipe (não é dono): menu reduzido e ações só nos próprios agendamentos
export function isProfessional(){
    return Cookies.get("userRole") === "PROFESSIONAL";
}

export function myProfessionalId(){
    return Cookies.get("professionalId");
}

// Tela inicial após o login: admin não tem empresa nem painel próprio
export function homePath(){
    return isAdmin() ? "/admin/clientes" : "/dashboard";
}

function clearSessionCookies(){
    Cookies.remove("token");
    Cookies.remove("expirationDate");
    Cookies.remove("companyInfo");
    Cookies.remove("companyProperties");
    Cookies.remove("companyFeatures");
    Cookies.remove("userRole");
    Cookies.remove("professionalId");
}

export async function logout(){
    clearSessionCookies();
    forgetPanelSession();
    try {
        // Limpa o cookie httpOnly no servidor. Não afeta o app mobile (que não
        // usa esse cookie para autenticar), mas é seguro chamar de qualquer forma.
        await api.post("/auth/logout", {}, { withCredentials: true });
    } catch (error) {
        console.error("Erro ao encerrar sessão no servidor:", error);
    }
}

// ---------- Sessão expirada ----------

// Telas do painel (dono, profissional e admin): exigem login. Manter em sincronia com as rotas de src/index.js.
const PANEL_PATHS = new Set([
    "/dashboard", "/agendamentos", "/configuracoes", "/alterar-senha", "/criar-agendamentos",
    "/assinatura", "/mudar-assinatura", "/servicos", "/analytics", "/relatorios", "/notificacoes",
    "/notificacoes-push", "/lista-de-espera", "/ajuda", "/divulgacao", "/configurar-horario-semanal",
    "/agenda-semanal", "/profissionais",
]);

export function isPanelPath(pathname){
    const path = (pathname || "").replace(/\/+$/, "") || "/";
    return PANEL_PATHS.has(path) || path.startsWith("/admin/");
}

// Marca que houve login neste navegador: diferencia "sessão expirou" de "nunca entrou".
// Os cookies da sessão somem sozinhos depois de algumas horas, então não servem para isso.
const SESSION_MARK = "hcPanelSession";

export function markPanelSession(){
    try { localStorage.setItem(SESSION_MARK, "1"); } catch { /* sem storage: só não mostra o aviso */ }
}

function hadPanelSession(){
    try { return localStorage.getItem(SESSION_MARK) === "1"; } catch { return false; }
}

function forgetPanelSession(){
    try { localStorage.removeItem(SESSION_MARK); } catch { /* idem */ }
}

// Só caminhos internos do próprio site (evita redirecionar para fora depois do login)
export function safeReturnPath(value){
    if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return null;
    return isPanelPath(value.split("?")[0]) ? value : null;
}

function loginPathFrom(fromPath){
    const params = new URLSearchParams();
    if (hadPanelSession()) params.set("sessao", "expirada");
    const back = safeReturnPath(fromPath);
    if (back) params.set("voltar", back);
    const query = params.toString();
    return "/login" + (query ? `?${query}` : "");
}

let redirecting = false;

// Leva para o login guardando a tela atual (from) para voltar depois de entrar
export function redirectToLogin(navigate, from = window.location.pathname + window.location.search){
    if (redirecting || from.split("?")[0] === "/login") return;
    const target = loginPathFrom(from);
    clearSessionCookies();
    forgetPanelSession();
    if (navigate) {
        navigate(target, { replace: true });
    } else {
        // Fora do React (resposta da API): recarrega já no login
        redirecting = true;
        window.location.assign(target);
    }
}

// Sessão do painel vencida enquanto o usuário está numa tela do painel
export function panelSessionExpired(){
    return isPanelPath(window.location.pathname) && !isAvailableLogin();
}

// Chamadas autenticadas do painel: não envia com a sessão vencida e trata o token recusado pelo servidor
api.interceptors.request.use((config) => {
    if (config.withAuth && panelSessionExpired()) {
        redirectToLogin();
        const error = new Error("Sua sessão expirou. Entre novamente.");
        error.sessionExpired = true;
        return Promise.reject(error);
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const body = error?.response?.data;
        const text = typeof body === "string" ? body : (body?.message || "");
        // 401 "Privilégios insuficientes" é falta de permissão, não sessão vencida
        if (status === 401 && error?.config?.withAuth && isPanelPath(window.location.pathname) &&
            !/privil[eé]gios/i.test(text)) {
            redirectToLogin();
            error.sessionExpired = true;
        }
        return Promise.reject(error);
    }
);
