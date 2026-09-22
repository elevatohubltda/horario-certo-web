import { format } from 'date-fns';
import Cookies from "js-cookie";

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
    const token = Cookies.get("token");
    if(!token) return false;
    const expirationDate = Cookies.get("expirationDate");
    if(now <= expirationDate) return true;
    Cookies.remove("token");
    Cookies.remove("expirationDate");
    Cookies.remove("companyInfo");
    Cookies.remove("companyProperties");
    Cookies.remove("companyFeatures");
    return false;
}

export function logout(){
    Cookies.remove("token");
    Cookies.remove("expirationDate");
    Cookies.remove("companyInfo");
    Cookies.remove("companyProperties");
    Cookies.remove("companyFeatures");
}