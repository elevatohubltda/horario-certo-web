import {
  formataNumeroTelefone,
  formatSchedulesToISO,
  maskTime,
  paraHoraCompleta,
  paraHoraSemSegundos,
  transformarHorariosPorData,
} from "./format";
import { generateTimeSlots } from "./util";
import { getWeekDay } from "./date";

describe("telefone", () => {
  it("formata enquanto a pessoa digita", () => {
    expect(formataNumeroTelefone("37")).toBe("37");
    expect(formataNumeroTelefone("379")).toBe("(37) 9");
    expect(formataNumeroTelefone("3799999")).toBe("(37) 9 9999");
    expect(formataNumeroTelefone("37999990000")).toBe("(37) 9 9999-0000");
  });

  it("ignora o que não é número e corta o excesso", () => {
    expect(formataNumeroTelefone("(37) 9 9999-0000 123")).toBe("(37) 9 9999-0000");
  });
});

describe("horários", () => {
  it("converte entre HH:mm e HH:mm:ss", () => {
    expect(paraHoraCompleta("09:30")).toBe("09:30:00");
    expect(paraHoraCompleta("09:30:00")).toBe("09:30:00");
    expect(paraHoraSemSegundos("09:30:00")).toBe("09:30");
  });

  it("máscara de hora aceita só números e limita a HH:MM", () => {
    expect(maskTime("0930")).toBe("09:30");
    expect(maskTime("09a3")).toBe("09:3");
    expect(maskTime("093055")).toBe("09:30");
  });

  it("agrupa horários por data, em ordem", () => {
    const grouped = transformarHorariosPorData([
      { schedule: "2026-11-11T10:00:00", available: true },
      { schedule: "2026-11-10T14:00:00", available: false, name: "Ana" },
      { schedule: "2026-11-10T09:00:00", available: true },
    ]);
    expect(grouped.map((g) => g.data)).toEqual(["10/11/2026", "11/11/2026"]);
    expect(grouped[0].horarios.map((h) => h.horario)).toEqual(["09:00", "14:00"]);
    expect(grouped[0].horarios[1].name).toBe("Ana");
  });

  it("monta datas ISO locais a partir de dd/MM/yyyy ou yyyy-MM-dd", () => {
    expect(formatSchedulesToISO({ date: "10/11/2026", schedules: ["09:00"] })).toEqual(["2026-11-10T09:00:00.000"]);
    expect(formatSchedulesToISO({ date: "2026-11-10", schedules: ["14:30", ""] })).toEqual(["2026-11-10T14:30:00.000"]);
    expect(formatSchedulesToISO({ date: "", schedules: ["09:00"] })).toEqual([]);
  });

  it("gera a grade de horários respeitando a pausa", () => {
    expect(
      generateTimeSlots({ openTime: "08:00", closeTime: "10:00", durationTime: 30, interval: [{ start: "09:00", end: "09:30" }] })
    ).toEqual(["08:00", "08:30", "09:30"]);
  });

  it("dia da semana em português", () => {
    expect(getWeekDay("02/11/2026")).toBe("segunda-feira");
  });
});
