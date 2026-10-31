import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { getWhatsAppUsage } from "../services/endpoints/admin";

/* ================= STYLES ================= */

const Page = styled.div`
  min-height: 100vh;
  background: #f9fafb;
  padding: 1.5rem 1rem 3rem;
  box-sizing: border-box;
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
`;

const PageTitle = styled.h1`
  margin: 0 0 0.25rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-dark, #111827);
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: #6b7280;
`;

const MonthInput = styled.input`
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  padding: 0.45rem 0.6rem;
  font-size: 0.85rem;
  background: #fff;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const SummaryCard = styled.div`
  background: #fff;
  border-radius: 0.75rem;
  padding: 0.9rem 1rem;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
`;

const SummaryLabel = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
`;

const SummaryValue = styled.div`
  font-size: 1.35rem;
  font-weight: 700;
  margin-top: 0.2rem;
  color: ${(props) => props.$color || "#111827"};
`;

const TableCard = styled.div`
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
  min-width: 820px;

  th {
    text-align: left;
    font-weight: 600;
    color: #6b7280;
    padding: 0.7rem 0.8rem;
    border-bottom: 1px solid #e5e7eb;
    white-space: nowrap;
  }

  td {
    padding: 0.7rem 0.8rem;
    border-bottom: 1px solid #f3f4f6;
    color: #374151;
    vertical-align: top;
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

const Muted = styled.div`
  font-size: 0.72rem;
  color: #9ca3af;
  margin-top: 0.15rem;
`;

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

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  white-space: nowrap;
  background: ${(props) => props.$style.background};
  color: ${(props) => props.$style.color};
  border: 1px solid ${(props) => props.$style.border};
`;

const Message = styled.div`
  background: #fff;
  border-radius: 0.75rem;
  padding: 1.5rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.9rem;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
`;

const BackLink = styled.button`
  background: none;
  border: none;
  color: #2563eb;
  font-size: 0.82rem;
  cursor: pointer;
  padding: 0;
  margin-bottom: 0.75rem;
`;

/* ================= HELPERS ================= */

const STATUS_STYLES = {
  OK: { label: "Dentro do esperado", background: "#ecfdf5", color: "#065f46", border: "#6ee7b7" },
  ATENCAO: { label: "Atenção (≥ 80%)", background: "#fffbeb", color: "#92400e", border: "#fcd34d" },
  ACIMA: { label: "Acima do esperado", background: "#fef2f2", color: "#991b1b", border: "#fca5a5" },
  SEM_REFERENCIA: { label: "Sem referência", background: "#f3f4f6", color: "#4b5563", border: "#d1d5db" },
};

const BAR_COLORS = { OK: "#16a34a", ATENCAO: "#d97706", ACIMA: "#dc2626", SEM_REFERENCIA: "#9ca3af" };

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

const formatNumber = (value) => Number(value || 0).toLocaleString("pt-BR");

/* ================= PAGE ================= */

function AdminWhatsAppUsage() {
  const navigate = useNavigate();
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
      const status = err?.response?.status;
      setError(
        status === 403 || status === 401
          ? "Acesso restrito a administradores."
          : "Não foi possível carregar o uso de mensagens."
      );
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
    <Page>
      <Content>
        <BackLink onClick={() => navigate("/dashboard")}>← Voltar ao painel</BackLink>

        <Header>
          <div>
            <PageTitle>Mensagens WhatsApp por cliente</PageTitle>
            <Subtitle>
              Mensagens disparadas no mês comparadas ao esperado para o plano de cada cliente.
              {usage?.currentMonth && " A projeção estima o mês inteiro no ritmo atual."}
            </Subtitle>
          </div>
          <MonthInput
            type="month"
            value={month}
            max={currentMonth()}
            onChange={(e) => setMonth(e.target.value || currentMonth())}
          />
        </Header>

        {loading ? (
          <Message>Carregando...</Message>
        ) : error ? (
          <Message>{error}</Message>
        ) : (
          <>
            <SummaryGrid>
              <SummaryCard>
                <SummaryLabel>Mensagens enviadas</SummaryLabel>
                <SummaryValue>{formatNumber(usage.totalSent)}</SummaryValue>
              </SummaryCard>
              <SummaryCard>
                <SummaryLabel>Esperado (clientes ativos)</SummaryLabel>
                <SummaryValue>{formatNumber(usage.totalExpected)}</SummaryValue>
              </SummaryCard>
              <SummaryCard>
                <SummaryLabel>Clientes acima do esperado</SummaryLabel>
                <SummaryValue $color={aboveExpected > 0 ? "#dc2626" : undefined}>
                  {aboveExpected}
                </SummaryValue>
              </SummaryCard>
              <SummaryCard>
                <SummaryLabel>Bloqueadas por limite do plano</SummaryLabel>
                <SummaryValue $color={totalBlocked > 0 ? "#d97706" : undefined}>
                  {formatNumber(totalBlocked)}
                </SummaryValue>
              </SummaryCard>
            </SummaryGrid>

            {companies.length === 0 ? (
              <Message>Nenhum cliente encontrado.</Message>
            ) : (
              <TableCard>
                <Table>
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
                      const statusStyle = STATUS_STYLES[company.status] || STATUS_STYLES.SEM_REFERENCIA;
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
                              <UsageBar $percent={company.usagePercent} $color={BAR_COLORS[company.status]}>
                                <span />
                              </UsageBar>
                            )}
                          </td>
                          <td>
                            {formatNumber(company.failed)} / {formatNumber(company.blockedByLimit)}
                          </td>
                          <td>
                            <StatusBadge $style={statusStyle}>{statusStyle.label}</StatusBadge>
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
      </Content>
    </Page>
  );
}

export default AdminWhatsAppUsage;
