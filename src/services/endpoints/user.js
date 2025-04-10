import api from "../api";

export const registerUser = (data) => api.post("/user/signin", data);
export const updateUser = (data) => api.put("/user/signin", data);
export const deleteUser = (username) => api.delete(`/user?username=${username}`);
export const getAllUsers = () => api.get("/user/listAll");