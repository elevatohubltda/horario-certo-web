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