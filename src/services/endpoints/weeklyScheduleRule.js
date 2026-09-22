import api from "../api";

export const getWeeklyScheduleRules = (companyUrl) =>
  api.get(`/weekly-schedule-rule?companyUrl=${companyUrl}`, { withAuth: true });

export const saveWeeklyScheduleRules = (companyUrl, rules) =>
  api.put(`/weekly-schedule-rule?companyUrl=${companyUrl}`, rules, {
    withAuth: true,
    headers: { "Content-Type": "application/json" }
  });

export const getSimpleAvailability = (companyUrl, startDate, endDate, withAuth = false) =>
  api.get(
    `/company-schedule/simple-availability?companyUrl=${companyUrl}&startDate=${startDate}&endDate=${endDate}`,
    { withAuth }
  );
