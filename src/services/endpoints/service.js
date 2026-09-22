import api from "../api";

export const getServices = (companyUrl) =>
  api.get(`/service?companyUrl=${companyUrl}`, { withAuth: true });

export const getServicesPublic = (companyUrl) =>
  api.get(`/service/public?companyUrl=${companyUrl}`, { withAuth: false });

export const createService = (companyUrl, serviceData) =>
  api.post(
    `/service?companyUrl=${companyUrl}`,
    serviceData,
    { withAuth: true, headers: { "Content-Type": "application/json" } }
  );

export const updateServiceStatus = (companyUrl, id) => {
  const params = new URLSearchParams({ companyUrl, id }).toString();
  return api.put(
    `/service?${params}`,
    null,
        {
            withAuth: true,
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
};

export const updateService = (companyUrl, id, serviceData) => {
  const params = new URLSearchParams({ companyUrl, id }).toString();
  return api.put(
    `/service/edit?${params}`,
    serviceData,
    { withAuth: true, headers: { "Content-Type": "application/json" } }
  );
};

export const deleteService = (companyUrl, id) => {
  const params = new URLSearchParams({ companyUrl, id }).toString();
  return api.delete(`/service?${params}`, { withAuth: true });
};
