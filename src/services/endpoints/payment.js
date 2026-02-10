import api from "../api";

export const getClientStatus = (companyUrl) => {
    const params = new URLSearchParams({ companyUrl }).toString();
    return api.get(`/payment/status?${params}`, { withAuth: true })
};

export const getPaymentStatus = (companyUrl) => {
    const params = new URLSearchParams({ companyUrl }).toString();
    return api.get(`/payment?${params}`, { withAuth: true })
};