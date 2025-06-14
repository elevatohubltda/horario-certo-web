import api from "../api";

export const getCompany = (companyUrl) => api.get("/company?companyUrl=" + companyUrl, { withAuth: false });
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