import api from "../api";

const withCompany = (companyUrl) => new URLSearchParams({ companyUrl }).toString();

export const getProfessionals = (companyUrl) =>
    api.get(`/professionals?${withCompany(companyUrl)}`, { withAuth: true });

export const createProfessional = (companyUrl, payload) =>
    api.post(`/professionals?${withCompany(companyUrl)}`, payload, { withAuth: true });

export const updateProfessional = (companyUrl, professionalId, payload) =>
    api.put(`/professionals/${professionalId}?${withCompany(companyUrl)}`, payload, { withAuth: true });

export const setProfessionalAccess = (companyUrl, professionalId, payload) =>
    api.put(`/professionals/${professionalId}/access?${withCompany(companyUrl)}`, payload, { withAuth: true });

// Limite de profissionais do plano, buscado uma vez por carregamento da página (usado no menu)
let maxProfessionalsPromise = null;
export const fetchMaxProfessionals = (companyUrl) => {
    if (!companyUrl) return Promise.resolve(1);
    if (!maxProfessionalsPromise) {
        maxProfessionalsPromise = getProfessionals(companyUrl)
            .then((response) => response.data?.maxProfessionals || 1)
            .catch(() => {
                maxProfessionalsPromise = null;
                return 1;
            });
    }
    return maxProfessionalsPromise;
};
