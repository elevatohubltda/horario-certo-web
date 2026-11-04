import api from "../api";

export const getClientStatus = (companyUrl) => {
    const params = new URLSearchParams({ companyUrl }).toString();
    return api.get(`/payment/status?${params}`, { withAuth: true })
};

export const getPayment = (companyUrl) => {
    const params = new URLSearchParams({ companyUrl }).toString();
    return api.get(`/payment?${params}`, { withAuth: true })
};

export const getSubscriptionPlans = (companyUrl) => {
    const params = new URLSearchParams({ companyUrl }).toString();
    return api.get(`/plans/screen-data?${params}`, { withAuth: true })
};

export const getPublicSubscriptionPlans = () => {
    return api.get('/plans/public-screen-data');
};

export const updateSubscription = (companyUrl, payload) => {
    const params = new URLSearchParams({ companyUrl }).toString();
    return api.put(`/payment/subscription?${params}`, payload, { withAuth: true });
};

export const validatePayment = (paymentId, companyUrl) => {
    const params = new URLSearchParams({ paymentId, companyUrl }).toString();
    return api.get(`/payment/validate?${params}`, { withAuth: true });
};

export const validateDiscountCode = (code) => {
    const params = new URLSearchParams({ code }).toString();
    return api.get(`/discount-code/validate?${params}`, { withAuth: false });
};

export const generateOverdueInvoice = (companyUrl) => {
    const params = new URLSearchParams({ companyUrl }).toString();
    return api.post(`/payment/overdue-invoice?${params}`, {}, { withAuth: true });
};

// Pula o teste grátis: gera agora o Pix da primeira mensalidade (valor calculado no backend)
export const subscribeNow = (companyUrl) => {
    const params = new URLSearchParams({ companyUrl }).toString();
    return api.post(`/payment/subscribe-now?${params}`, {}, { withAuth: true });
};

export const createCardSubscription = (companyUrl) => {
    const params = new URLSearchParams({ companyUrl }).toString();
    return api.post(`/payment/card-subscription?${params}`, {}, { withAuth: true });
};

export const cancelCardSubscription = (companyUrl) => {
    const params = new URLSearchParams({ companyUrl }).toString();
    return api.delete(`/payment/card-subscription?${params}`, { withAuth: true });
};
// Cancela a assinatura; refund=true só vale até 7 dias do 1º pagamento (arrependimento)
export const cancelSubscription = (companyUrl, payload) => {
    const params = new URLSearchParams({ companyUrl }).toString();
    return api.post(`/payment/cancel-subscription?${params}`, payload, { withAuth: true });
};

// Desfaz o cancelamento antes do fim do acesso
export const reactivateSubscription = (companyUrl) => {
    const params = new URLSearchParams({ companyUrl }).toString();
    return api.post(`/payment/reactivate-subscription?${params}`, {}, { withAuth: true });
};
