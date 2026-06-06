import api from "../api";

export const getPushNotificationSettings = (companyUrl) =>
    api.get(`/push-notifications/settings?companyUrl=${companyUrl}`, { withAuth: true });

export const updatePushNotificationSettings = (companyUrl, data) =>
    api.put(`/push-notifications/settings?companyUrl=${companyUrl}`, data, { withAuth: true });

export const registerPushToken = (companyUrl, token) =>
    api.post(`/push-notifications/register?companyUrl=${companyUrl}`, { token }, { withAuth: true });

export const unregisterPushToken = (companyUrl, token) =>
    api.post(`/push-notifications/unregister?companyUrl=${companyUrl}`, { token }, { withAuth: true });
