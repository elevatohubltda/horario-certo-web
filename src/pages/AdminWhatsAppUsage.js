import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { getWhatsAppUsage } from "../services/endpoints/admin";
import {
  AdminLayout,
  Badge,
  Card,
  Input,
  Message,
  Muted,
  SummaryGrid,
  SummaryLabel,
  SummaryValue,
  Table,
  TableCard,
  errorMessage,
  formatNumber,
} from "../components/admin";

/* ================= STYLES ================= */

const UsageBar = styled.div`
  width: 110px;
  height: 6px;
  border-radius: 999px;
  background: #e5e7eb;
  margin-top: 0.35rem;
  overflow: hidden;

  span {
    display: block;
    height: 100%;
    width: ${(props) => Math.min(props.$percent, 100)}%;
    background: ${(props) => props.$color};
  }
`;

/* ================= HELPERS ================= */

const STATUS = {
  OK: { label: "Dentro do esperado", tone: "green", bar: "#16a34a" },
  ATENCAO: { label: "Atenção (≥ 80%)", tone: "yellow", bar: "#d97706" },
  ACIMA: { label: "Acima do esperado", tone: "red", bar: "#dc2626" },
  SEM_REFERENCIA: { label: "Sem referência", tone: "gray", bar: "#9ca3af" },
};

const TYPE_LABELS = {
  BOOKING_CONFIRMATION: "Confirmação",
  REMINDER: "Lembrete",
  RESCHEDULE: "Remarcação",
  CANCELLATION: "Cancelamento",
  RETENTION: "Retenção",
  PASSWORD_RESET: "Senha",
};

const currentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

/* ================= PAGE ================= */

function AdminWhatsAppUsage() {
  const [month, setMonth] = useState(currentMonth());
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getWhatsAppUsage(month);
      setUsage(response.data);
    } catch (err) {
      setError(errorMessage(err, "Não foi possível carregar o uso de mensagens."));
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const companies = usage?.companies || [];
  const aboveExpected = companies.filter((c) => c.status === "ACIMA").length;
  const totalBlocked = companies.reduce((sum, c) => sum + (c.blockedByLimit || 0), 0);

  return (
    <AdminLayout
      title="Uso WhatsApp"
      subtitle={`Mensagens disparadas no mês comparadas ao esperado para o plano de cada cliente.${
        usage?.currentMonth ? " A projeção estima o mês inteiro no ritmo atual." : ""
      }`}
      actions={
        <Input
          type="month"
          value={month}
          max={currentMonth()}
          onChange={(e) => setMonth(e.target.value || currentMonth())}
        />
      }
    >
      {loading ? (
        <Message>Carregando...</Message>
      ) : error ? (
        <Message>{error}</Message>
      ) : (
        <>
          <SummaryGrid>
            <Card>
              <SummaryLabel>Mensagens enviadas</SummaryLabel>
              <SummaryValue>{formatNumber(usage.totalSent)}</SummaryValue>
            </Card>
            <Card>
              <SummaryLabel>Esperado (clientes ativos)</SummaryLabel>
              <SummaryValue>{formatNumber(usage.totalExpected)}</SummaryValue>
            </Card>
            <Card>
              <SummaryLabel>Clientes acima do esperado</SummaryLabel>
              <SummaryValue $color={aboveExpected > 0 ? "#dc2626" : undefined}>{aboveExpected}</SummaryValue>
            </Card>
            <Card>
              <SummaryLabel>Bloqueadas por limite do plano</SummaryLabel>
              <SummaryValue $color={totalBlocked > 0 ? "#d97706" : undefined}>{formatNumber(totalBlocked)}</SummaryValue>
            </Card>
          </SummaryGrid>

          {companies.length === 0 ? (
            <Message>Nenhum cliente encontrado.</Message>
          ) : (
            <TableCard>
              <Table $minWidth="820px">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Plano</th>
                    <th>Enviadas</th>
                    <th>Esperado/mês</th>
                    <th>{usage.currentMonth ? "Projeção" : "Total"}</th>
                    <th>Uso</th>
                    <th>Falhas / bloqueadas</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company) => {
                    const status = STATUS[company.status] || STATUS.SEM_REFERENCIA;
                    const byType = Object.entries(company.sentByType || {})
                      .map(([type, total]) => `${TYPE_LABELS[type] || type}: ${total}`)
                      .join(" · ");
                    return (
                      <tr key={company.companyUrl || company.companyName}>
                        <td>
                          <strong>{company.companyName}</strong>
                          <Muted>
                            {company.companyUrl}
                            {!company.active && " · bloqueado"}
                          </Muted>
                        </td>
                        <td>{company.planName}</td>
                        <td>
                          {formatNumber(company.sent)}
                          {byType && <Muted>{byType}</Muted>}
                        </td>
                        <td>{company.expectedMessages > 0 ? formatNumber(company.expectedMessages) : "-"}</td>
                        <td>{formatNumber(company.projected)}</td>
                        <td>
                          {company.usagePercent != null ? `${company.usagePercent}%` : "-"}
                          {company.usagePercent != null && (
                            <UsageBar $percent={company.usagePercent} $color={status.bar}>
                              <span />
                            </UsageBar>
                          )}
                        </td>
                        <td>
                          {formatNumber(company.failed)} / {formatNumber(company.blockedByLimit)}
                        </td>
                        <td>
                          <Badge $tone={status.tone}>{status.label}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </TableCard>
          )}
        </>
      )}
    </AdminLayout>
  );
}

export default AdminWhatsAppUsage;
