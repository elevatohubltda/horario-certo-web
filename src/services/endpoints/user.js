import api from "../api";

export const registerUser = (data) => api.post("/user", data, { withAuth: false });

export const updatePassword = (data) => {
    return api.put(`/user`, data, { withAuth: true });
};

export const deleteUser = (username) => api.delete(`/user`, { data: { username }, withAuth: false });

export const getAllUsers = () => api.get("/user/listAll", { withAuth: false });

export const forgotPassword = (username, whatsapp) =>
    api.post(`/user/forgot-password?username=${encodeURIComponent(username)}&whatsapp=${encodeURIComponent(whatsapp)}`, {}, { withAuth: false });

export const resetPassword = (username, code, newPassword) =>
    api.post(`/user/reset-password?username=${encodeURIComponent(username)}&code=${encodeURIComponent(code)}&newPassword=${encodeURIComponent(newPassword)}`, {}, { withAuth: false });