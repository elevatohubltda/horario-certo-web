import api from "../api";

export const addToWaitingQueue = (companyUrl, data) => {
  const params = new URLSearchParams({ companyUrl }).toString();
  return api.post(`/waiting-queue?${params}`, data, {
    headers: { "Content-Type": "application/json" },
  });
};

export const getWaitingQueue = (startDate, endDate) => {
  const params = new URLSearchParams({ startDate, endDate }).toString();
  return api.get(`/waiting-queue?${params}`, { withAuth: true });
};

export const deleteWaitingQueueEntry = (id) => {
  return api.delete(`/waiting-queue/${id}`, { withAuth: true });
};
