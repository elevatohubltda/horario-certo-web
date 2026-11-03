import { bookingAmount, bookingCommission, summarizeProfessionalRevenue, summarizeRevenue } from "./revenue";

const ownerBooking = (amount) => ({ available: false, professionalIsOwner: true, service: { amount } });
const teamBooking = (amount, commissionAmount) => ({
  available: false,
  professionalIsOwner: false,
  service: { amount },
  commissionAmount,
});

describe("faturamento do dono", () => {
  it("soma o valor dos atendimentos do dono e só a comissão dos atendimentos da equipe", () => {
    const summary = summarizeRevenue([ownerBooking(100), ownerBooking(50), teamBooking(80, 24)]);
    expect(summary).toEqual({ revenue: 150, commission: 24, total: 174 });
  });

  it("horários livres não entram na conta", () => {
    expect(summarizeRevenue([{ available: true, service: { amount: 100 } }])).toEqual({ revenue: 0, commission: 0, total: 0 });
  });

  it("sem informação de profissional o atendimento é do dono (dados antigos)", () => {
    expect(summarizeRevenue([{ available: false, service: { price: "40.5" } }]).revenue).toBeCloseTo(40.5);
  });

  it("valor inválido conta como zero", () => {
    expect(bookingAmount({ service: { amount: "abc" } })).toBe(0);
    expect(bookingAmount(null)).toBe(0);
  });

  it("valor gravado no agendamento tem prioridade sobre o preço do serviço", () => {
    expect(bookingAmount({ service: { amount: 70, price: 90 } })).toBe(70);
  });

  it("comissão só existe em atendimento da equipe", () => {
    expect(bookingCommission(teamBooking(80, 24))).toBe(24);
    expect(bookingCommission({ ...teamBooking(80, 24), professionalIsOwner: true })).toBe(0);
  });
});

describe("faturamento do profissional da equipe", () => {
  it("separa bruto, parte do estabelecimento e líquido", () => {
    const summary = summarizeProfessionalRevenue([teamBooking(100, 30), teamBooking(50, 15), { available: true }]);
    expect(summary).toEqual({ gross: 150, establishmentShare: 45, net: 105 });
  });
});
