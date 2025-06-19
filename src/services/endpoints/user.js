import api from "../api";

export const registerUser = (data) => api.post("/user", data, { withAuth: false });

export const updatePassword = (data) => {
    return api.put(`/user`, data, { withAuth: true });
};

export const deleteUser = (username) => api.delete(`/user`, { data: { username }, withAuth: false });

export const getAllUsers = () => api.get("/user/listAll", { withAuth: false });