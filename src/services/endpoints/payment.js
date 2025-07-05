import api from "../api";

export const getClientStatus = (companyUrl) => {
    const params = new URLSearchParams({ companyUrl }).toString();
    return api.get(`/payment?${params}`, { withAuth: true })
};