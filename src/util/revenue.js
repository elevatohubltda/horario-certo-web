// Resumo financeiro dos agendamentos para o dono:
// - faturamento: valor dos atendimentos feitos pelo próprio dono;
// - comissão: parte do dono nos atendimentos feitos pela equipe (gravada em cada agendamento);
// - total: faturamento + comissão.
// Só agendamentos reservados (available === false) entram na conta.

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const bookingAmount = (item) => toNumber(item?.service?.amount ?? item?.service?.price ?? 0);

export const bookingCommission = (item) => (item?.professionalIsOwner === false ? toNumber(item?.commissionAmount) : 0);

export function summarizeRevenue(schedules = []) {
  return schedules
    .filter((item) => item?.available === false)
    .reduce(
      (acc, item) => {
        // Sem a informação do profissional (dados antigos/empresa com um só), o atendimento é do dono
        if (item?.professionalIsOwner === false) {
          acc.commission += bookingCommission(item);
        } else {
          acc.revenue += bookingAmount(item);
        }
        acc.total = acc.revenue + acc.commission;
        return acc;
      },
      { revenue: 0, commission: 0, total: 0 }
    );
}

// Resumo financeiro do profissional da equipe (sobre os agendamentos dele):
// - bruto: valor total dos atendimentos;
// - parte do estabelecimento: o que fica com o dono (gravado em cada agendamento);
// - líquido: bruto − parte do estabelecimento.
export function summarizeProfessionalRevenue(schedules = []) {
  return schedules
    .filter((item) => item?.available === false)
    .reduce(
      (acc, item) => {
        acc.gross += bookingAmount(item);
        acc.establishmentShare += toNumber(item?.commissionAmount);
        acc.net = acc.gross - acc.establishmentShare;
        return acc;
      },
      { gross: 0, establishmentShare: 0, net: 0 }
    );
}

export const formatMoney = (value) =>
  toNumber(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
