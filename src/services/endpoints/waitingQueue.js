import api from "../api";

export const addToWaitingQueue = (companyUrl, data) => {
  const params = new URLSearchParams({ companyUrl }).toString();
  return api.post(`/waiting-queue?${params}`, data, {
    headers: { "Content-Type": "application/json" },
  });
};

export const getWaitingQueue = () => {
  return api.get("/waiting-queue", { withAuth: true });
};

export const deleteWaitingQueueEntry = (id) => {
  return api.delete(`/waiting-queue/${id}`, { withAuth: true });
};
