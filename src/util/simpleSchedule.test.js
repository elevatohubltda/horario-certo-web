import { computeAvailableSlots } from "./simpleSchedule";

const free = (slots) => slots.filter((s) => s.available).map((s) => s.horario);

describe("computeAvailableSlots (agenda simples)", () => {
  it("sem horário de funcionamento ou duração não gera horários", () => {
    expect(computeAvailableSlots({ openTime: null, closeTime: "18:00", durationMinutes: 30 })).toEqual([]);
    expect(computeAvailableSlots({ openTime: "08:00", closeTime: "18:00", durationMinutes: 0 })).toEqual([]);
  });

  it("gera horários na duração do serviço entre abertura e fechamento", () => {
    const slots = computeAvailableSlots({ openTime: "08:00:00", closeTime: "10:00:00", durationMinutes: 30 });
    expect(free(slots)).toEqual(["08:00", "08:30", "09:00", "09:30"]);
  });

  it("não oferece horário que termina depois do fechamento", () => {
    const slots = computeAvailableSlots({ openTime: "08:00", closeTime: "09:30", durationMinutes: 60 });
    expect(free(slots)).toEqual(["08:00"]);
  });

  it("pausas criam um vão na agenda", () => {
    const slots = computeAvailableSlots({
      openTime: "08:00",
      closeTime: "12:00",
      durationMinutes: 30,
      intervals: [{ startTime: "10:00", endTime: "10:30" }],
    });
    expect(free(slots)).toEqual(["08:00", "08:30", "09:00", "09:30", "10:30", "11:00", "11:30"]);
  });

  it("agendamento existente aparece uma vez como indisponível e a agenda continua depois dele", () => {
    const slots = computeAvailableSlots({
      openTime: "08:00",
      closeTime: "11:00",
      durationMinutes: 30,
      bookedSlots: [{ start: "2026-11-10T09:00:00", durationMinutes: 60 }],
    });
    expect(slots).toEqual([
      { horario: "08:00", available: true },
      { horario: "08:30", available: true },
      { horario: "09:00", available: false },
      { horario: "10:00", available: true },
      { horario: "10:30", available: true },
    ]);
  });

  it("horário livre não invade o próximo agendamento", () => {
    const slots = computeAvailableSlots({
      openTime: "08:00",
      closeTime: "10:30",
      durationMinutes: 60,
      bookedSlots: [{ start: "2026-11-10T08:30:00", durationMinutes: 30 }],
    });
    expect(slots).toEqual([
      { horario: "08:30", available: false },
      { horario: "09:00", available: true },
    ]);
  });

  it("agendamento sem duração conta como 30 minutos", () => {
    const slots = computeAvailableSlots({
      openTime: "08:00",
      closeTime: "09:00",
      durationMinutes: 30,
      bookedSlots: [{ start: "2026-11-10T08:00:00" }],
    });
    expect(slots).toEqual([
      { horario: "08:00", available: false },
      { horario: "08:30", available: true },
    ]);
  });
});
