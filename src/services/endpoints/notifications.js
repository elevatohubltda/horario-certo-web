import api from "../api";

export const getNotificationSettings = (companyUrl) =>
    api.get(`/notifications/settings?companyUrl=${companyUrl}`, { withAuth: true });

export const updateNotificationSettings = (companyUrl, data) =>
    api.put(`/notifications/settings?companyUrl=${companyUrl}`, data, { withAuth: true });
