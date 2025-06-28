import api from "../api";

export const createSchedule = (companyUrl, schedule) => {
  const params = new URLSearchParams({ companyUrl }).toString();
  return api.post(
    `/company-schedule?${params}`, 
    schedule, 
        { 
            withAuth: true,
            headers: {
            "Content-Type": "application/json",
            },
        }   
    );
};