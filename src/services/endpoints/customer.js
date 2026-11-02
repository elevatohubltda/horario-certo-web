import api from "../api";

// Área do cliente final. A sessão fica em cookies httpOnly e o backend renova o acesso sozinho.
export const registerCustomer = (data) => api.post("/customer/auth/register", data);

export const loginCustomer = (email, password) => api.post("/customer/auth/login", { email, password });

export const loginCustomerWithGoogle = (credential) => api.post("/customer/auth/google", { credential });

export const logoutCustomer = () => api.post("/customer/auth/logout");

export const getCustomerMe = () => api.get("/customer/me");

export const updateCustomerMe = (data) => api.put("/customer/me", data);

export const getCustomerAppointments = () => api.get("/customer/appointments");

export const cancelCustomerAppointment = (id) => api.post(`/customer/appointments/${id}/cancel`);

export const rescheduleCustomerAppointment = (id, schedule) =>
  api.put(`/customer/appointments/${id}/reschedule`, { schedule });
