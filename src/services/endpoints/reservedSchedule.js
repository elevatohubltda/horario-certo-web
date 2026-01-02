import api from "../api";

export const createReservedSchedule = (companyUrl, schedule) => {
  const params = new URLSearchParams({ companyUrl }).toString();
  return api.post(
    `/reserved-schedule?${params}`, 
    schedule, 
        { 
            withAuth: true,
            headers: {
            "Content-Type": "application/json",
            },
        }   
    );
};

export const createReservedScheduleByOwner = (companyUrl, schedule) => {
  const params = new URLSearchParams({ companyUrl }).toString();
  return api.post(
    `/reserved-schedule?${params}`, 
    schedule, 
        { 
            withAuth: true,
            headers: {
            "Content-Type": "application/json",
            },
        }   
    );
};

export const updateSchedule = (companyUrl, schedule) => {
  const params = new URLSearchParams({ companyUrl }).toString();
  return api.put(
    `/reserved-schedule?${params}`,
    schedule,
        {
            withAuth: true,
            headers: {
                "Content-Type": "application/json",
            },
        }  
    );
};

export const removeReservedSchedule = (companyUrl, schedule) => {
  const params = new URLSearchParams({ companyUrl }).toString();

  return api.delete(
    `/reserved-schedule?${params}`,
    {
      data: schedule,
      withAuth: true,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

export const removeReservedScheduleByOwner = (companyUrl, schedule, onlyUncheck) => {
  const params = new URLSearchParams({ companyUrl, schedule, onlyUncheck }).toString();

  return api.delete(
    `/reserved-schedule/owner?${params}`,
    {
      withAuth: true,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};