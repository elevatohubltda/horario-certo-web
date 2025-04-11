import { format } from 'date-fns';
import Cookies from "js-cookie";

export function isAvailableLogin(){
    const now = format(new Date(), 'HH:mm:ss dd/MM/yyyy');
    const token = Cookies.get("token");
    if(!token) return false;
    const expirationDate = Cookies.get("expirationDate");
    if(now <= expirationDate) return true;
    Cookies.remove("token");
    Cookies.remove("expirationDate");
    return false;
}