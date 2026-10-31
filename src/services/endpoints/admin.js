import api from "../api";

export const getWhatsAppUsage = (month) => {
    const params = new URLSearchParams(month ? { month } : {}).toString();
    return api.get(`/admin/whatsapp/usage${params ? `?${params}` : ""}`, { withAuth: true });
};
