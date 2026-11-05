import api from "../api";

export const getWhatsAppUsage = (month) => {
    const params = new URLSearchParams(month ? { month } : {}).toString();
    return api.get(`/admin/whatsapp/usage${params ? `?${params}` : ""}`, { withAuth: true });
};

export const getAdminClients = () => api.get("/admin/clients", { withAuth: true });

export const blockClientAccess = (companyId) =>
    api.post(`/admin/clients/${companyId}/block`, {}, { withAuth: true });

export const releaseClientAccess = (companyId) =>
    api.post(`/admin/clients/${companyId}/release`, {}, { withAuth: true });

// Reembolso de arrependimento já devolvido ao cliente (na Stripe)
export const markClientRefundDone = (companyId) =>
    api.post(`/admin/clients/${companyId}/refund-done`, {}, { withAuth: true });

// Notas fiscais (NFS-e) das mensalidades
export const getAdminInvoices = () => api.get("/admin/invoices", { withAuth: true });

export const retryAdminInvoice = (paymentId) =>
    api.post(`/admin/invoices/${paymentId}/retry`, {}, { withAuth: true });

// Homologação: nota de teste sem valor fiscal (opcionalmente com os dados de um cliente)
export const emitTestInvoice = (companyId) =>
    api.post(`/admin/invoices/test${companyId ? `?companyId=${companyId}` : ""}`, {}, { withAuth: true });

export const getTestInvoice = (ref) =>
    api.get(`/admin/invoices/test/${encodeURIComponent(ref)}`, { withAuth: true });

export const getAdminPlans =() => api.get("/admin/plans", { withAuth: true });

export const createAdminPlan = (payload) => api.post("/admin/plans", payload, { withAuth: true });

export const updateAdminPlan = (planId, payload) =>
    api.put(`/admin/plans/${planId}`, payload, { withAuth: true });

export const getDiscountCodes = () => api.get("/discount-code", { withAuth: true });

export const createDiscountCode = (payload) => api.post("/discount-code", payload, { withAuth: true });

export const updateDiscountCode = (id, payload) => api.put(`/discount-code/${id}`, payload, { withAuth: true });
