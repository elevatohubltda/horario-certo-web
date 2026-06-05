import api from "../api";

export const getFeaturesByCompany = (companyUrl) =>
    api.get(`/plans/users/features?companyUrl=${companyUrl}`, { withAuth: true });
