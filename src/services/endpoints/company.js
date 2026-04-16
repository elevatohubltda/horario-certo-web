import api from "../api";

export const getCompany = (companyUrl) => api.get(
    "/company?companyUrl=" + companyUrl
    , { withAuth: false });

export const createCompany = (companyData) => api.post(
    "/company",
    companyData , 
    { withAuth: true,
        headers: {
          "Content-Type": "application/json",
        },
    }
);

export const updateCompany = (companyData, companyUrl) => api.put(
    "/company",
    {
        name: companyData.name, 
        instagram: companyData.instagram,
        whatsapp: companyData.whatsapp,
        url: companyUrl
    } , 
    { withAuth: true,
        headers: {
          "Content-Type": "application/json",
        },
    }
);

export const getCompanySchedules = (companyUrl, startDate, endDate) => api.get(
    "/company-schedule/list?companyUrl=" + companyUrl +
    "&startDate=" + startDate +
    "&endDate=" + endDate
    , { withAuth: false });

export const getCompanySchedulesAuth = (companyUrl, startDate, endDate) => api.get(
    "/company-schedule/list?companyUrl=" + companyUrl +
    "&startDate=" + startDate +
    "&endDate=" + endDate
    , { withAuth: true });

export const getCompanyProperties = (companyUrl) => api.get(
    "/company-properties?companyUrl=" + companyUrl
    , { withAuth: true });

export const updateCompanyProperties = (companyUrl, companyProperties) => {
  const params = new URLSearchParams({ companyUrl, ...companyProperties }).toString();
  return api.put(`/company-properties?${params}`, null, { withAuth: true });
};

export const registerCompanyScheduleView = (companyUrl) => {
    const params = new URLSearchParams({ companyUrl }).toString();
    return api.post(`/company-analytics/schedule-view?${params}`, null, {
        withAuth: false,
    });
};

export const getCompanyScheduleViews = (companyUrl, startDate, endDate) => {
    const params = new URLSearchParams({ companyUrl, startDate, endDate }).toString();
    return api.get(`/company-analytics/schedule-view?${params}`, {
        withAuth: true,
    });
};