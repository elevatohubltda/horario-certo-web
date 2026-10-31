import api from "../api";

// professionalId opcional: sem ele, vale o horário do dono
const ruleParams = (companyUrl, professionalId) =>
  new URLSearchParams(professionalId ? { companyUrl, professionalId } : { companyUrl }).toString();

export const getWeeklyScheduleRules = (companyUrl, professionalId) =>
  api.get(`/weekly-schedule-rule?${ruleParams(companyUrl, professionalId)}`, { withAuth: true });

export const saveWeeklyScheduleRules = (companyUrl, rules, professionalId) =>
  api.put(`/weekly-schedule-rule?${ruleParams(companyUrl, professionalId)}`, rules, {
    withAuth: true,
    headers: { "Content-Type": "application/json" }
  });

export const getSimpleAvailability = (companyUrl, startDate, endDate, withAuth = false) =>
  api.get(
    `/company-schedule/simple-availability?companyUrl=${companyUrl}&startDate=${startDate}&endDate=${endDate}`,
    { withAuth }
  );
