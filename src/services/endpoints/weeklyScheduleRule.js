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

// professionalId opcional: sem ele, a agenda da empresa toda (com equipe, de todos os profissionais)
export const getSimpleAvailability = (companyUrl, startDate, endDate, withAuth = false, professionalId) =>
  api.get(
    `/company-schedule/simple-availability?${new URLSearchParams({
      companyUrl,
      startDate,
      endDate,
      ...(professionalId ? { professionalId } : {}),
    }).toString()}`,
    { withAuth }
  );

// Profissionais ativos da empresa (público), para o cliente escolher com quem agendar
export const getPublicProfessionals = (companyUrl) =>
  api.get(`/company-schedule/professionals?companyUrl=${companyUrl}`, { withAuth: false });
