import api from "../api";

export const subscribe = (subscription) => {
  return api.post(
    "/push/subscribe",
    subscription,
    { withAuth: true }
  );
};
