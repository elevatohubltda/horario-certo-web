import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import "../styles/index.css";
import { PageLayout } from "../components/admin";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { isAvailableLogin, redirectToLogin } from "../util/auth";
import { Download, FileText, FileSpreadsheet, Filter } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { getCompanySchedulesAuth } from "../services/endpoints/company";
import { fetchMaxProfessionals } from "../services/endpoints/professional";
import { bookingAmount, bookingCommission, formatMoney, summarizeRevenue } from "../util/revenue";

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

// Botões no padrão do sistema: pílula escura (principal) ou branca com borda
const Btn = styled.button`
  border: 1px solid ${({ $primary }) => ($primary ? "var(--ui-primary)" : "var(--ui-input-border)")};
  background: ${({ $primary }) => ($primary ? "var(--ui-primary)" : "#fff")};
  color: ${({ $primary }) => ($primary ? "#fff" : "var(--ui-text)")};
  border-radius: 999px;
  padding: 0.45rem 0.95rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 500;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    cursor: default;
    opacity: 0.6;
  }
`;

const FiltersCard = styled.div`
  box-shadow: var(--ui-card-shadow);
  background: #fff;
  border-radius: var(--ui-radius);
  padding: 1rem;
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.75rem;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.78rem;
  color: rgba(30, 44, 40, 0.75);
`;

const Input = styled.input`
  height: 38px;
  border: 1px solid rgba(30, 44, 40, 0.16);
  border-radius: 10px;
  padding: 0 0.7rem;
  font-size: 0.85rem;
  color: var(--color-dark);
`;

const Select = styled.select`
  height: 38px;
  border: 1px solid rgba(30, 44, 40, 0.16);
  border-radius: 10px;
  padding: 0 0.7rem;
  font-size: 0.85rem;
  color: var(--color-dark);
  background: #fff;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.85rem;

  @media (max-width: 960px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryCard = styled.div`
  border-radius: var(--ui-radius);
  background: ${({ $bg }) => $bg || "#fff"};
  box-shadow: var(--ui-card-shadow);
  padding: 0.9rem 1rem;
`;

const SummaryLabel = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: rgba(30, 44, 40, 0.7);
`;

const SummaryValue = styled.p`
  margin: 0.35rem 0 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-dark);
`;

const TableWrap = styled.div`
  background: #fff;
  border-radius: var(--ui-radius);
  box-shadow: var(--ui-card-shadow);
  overflow: hidden;
`;

const TableScroll = styled.div`
  overflow: auto;
  max-height: 500px;
`;

const Table = styled.table`
  width: 100%;
  min-width: 820px;
  border-collapse: collapse;

  thead th {
    background: #f6f8f6;
    color: rgba(30, 44, 40, 0.8);
    text-align: left;
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.72rem;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  tbody td {
    border-top: 1px solid rgba(30, 44, 40, 0.08);
    padding: 0.7rem;
    font-size: 0.84rem;
    color: var(--color-dark);
    white-space: nowrap;
  }
`;

const SortHeaderButton = styled.button`
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
`;

const EmptyState = styled.div`
  padding: 2rem;
  text-align: center;
  color: rgba(30, 44, 40, 0.6);
  font-size: 0.9rem;
`;

const fmtDate = (value) => {
  const d = new Date(value);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("pt-BR");
};

const fmtPeriodDate = (value) => {
  if (!value) return "-";
  const [year, month, day] = String(value).split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
};

const fmtTime = (value) => {
  const d = new Date(value);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};

const formatNow = () => {
  return new Date().toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const toIsoDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getRangeByPeriod = (period) => {
  const end = new Date();
  const start = new Date();
  if (period === "7") start.setDate(end.getDate() - 6);
  if (period === "15") start.setDate(end.getDate() - 14);
  if (period === "30") start.setDate(end.getDate() - 29);
  return { startDate: toIsoDate(start), endDate: toIsoDate(end) };
};

const statusName = (item) => {
  const now = new Date();
  const scheduleDate = item?.schedule ? new Date(item.schedule) : null;

  if (!scheduleDate || isNaN(scheduleDate.getTime())) return "Indefinido";
  if (item.available === true && scheduleDate >= now) return "Disponivel";
  if (item.available === false && scheduleDate >= now) return "Agendado";
  if (item.available === false && scheduleDate < now) return "Concluido";
  return "Expirado";
};

const csvEscape = (value) => {
  const val = value ?? "";
  return `"${String(val).replace(/"/g, '""')}"`;
};

let cachedLogoDataUrl;
const getHorarioCertoLogo = async () => {
  if (cachedLogoDataUrl) return cachedLogoDataUrl;

  try {
    const response = await fetch("/favicon.svg");
    const svgText = await response.text();
    const svgBlob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
    const blobUrl = URL.createObjectURL(svgBlob);

    const dataUrl = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, 128, 128);
        URL.revokeObjectURL(blobUrl);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => {
        URL.revokeObjectURL(blobUrl);
        reject(new Error("Erro ao carregar logo"));
      };
      img.src = blobUrl;
    });

    cachedLogoDataUrl = dataUrl;
    return dataUrl;
  } catch (error) {
    return null;
  }
};

export default function Reports() {
  const navigate = useNavigate();
  const companyUrl = Cookies.get("companyUrl");
  const [companyInfo] = useState(
    Cookies.get("companyInfo") ? JSON.parse(Cookies.get("companyInfo")) : undefined
  );

  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);
  // Com equipe, o relatório separa o faturamento do dono da comissão sobre os atendimentos da equipe
  const [hasTeam, setHasTeam] = useState(false);

  const [period, setPeriod] = useState("7");
  const [startDate, setStartDate] = useState(getRangeByPeriod("7").startDate);
  const [endDate, setEndDate] = useState(getRangeByPeriod("7").endDate);
  const [statusFilter, setStatusFilter] = useState("todos");
  const [serviceFilter, setServiceFilter] = useState("todos");
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "asc" });

  useEffect(() => {
    if (period === "custom") return;
    const range = getRangeByPeriod(period);
    setStartDate(range.startDate);
    setEndDate(range.endDate);
  }, [period]);

  useEffect(() => {
    if (isAvailableLogin()) {
      return;
    }
    redirectToLogin(navigate);
  }, [companyUrl, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!companyUrl || !startDate || !endDate) return;
      setLoading(true);

      const scheduleRes = await getCompanySchedulesAuth(companyUrl, startDate, endDate);

      setSchedules(scheduleRes?.data || []);
      setLoading(false);
    };

    if (isAvailableLogin()) {
      fetchData();
    }
  }, [companyUrl, startDate, endDate]);

  useEffect(() => {
    if (companyUrl) fetchMaxProfessionals(companyUrl).then((max) => setHasTeam(max > 1));
  }, [companyUrl]);

  const serviceOptions = useMemo(() => {
    const names = [
      ...new Set(
        schedules
          .map((item) => item?.service?.name)
          .filter(Boolean)
      ),
    ];
    return names;
  }, [schedules]);

  const filteredSchedules = useMemo(() => {
    return schedules.filter((item) => {
      const status = statusName(item);
      const serviceName = item?.service?.name || "Sem servico";
      const statusOk = statusFilter === "todos" ? true : status.toLowerCase() === statusFilter;
      const serviceOk = serviceFilter === "todos" ? true : serviceName === serviceFilter;
      return statusOk && serviceOk;
    });
  }, [schedules, statusFilter, serviceFilter]);

  const sortedSchedules = useMemo(() => {
    const getSortValue = (item, key) => {
      if (key === "date" || key === "time") {
        const ts = item?.schedule ? new Date(item.schedule).getTime() : Number.NaN;
        return Number.isNaN(ts) ? 0 : ts;
      }

      if (key === "status") return statusName(item).toLowerCase();
      if (key === "service") return (item?.service?.name || "Sem servico").toLowerCase();
      if (key === "name") return (item?.name || "").toLowerCase();
      if (key === "phone") return (item?.phone || "").toLowerCase();

      return "";
    };

    const sorted = [...filteredSchedules].sort((a, b) => {
      const valueA = getSortValue(a, sortConfig.key);
      const valueB = getSortValue(b, sortConfig.key);

      if (valueA < valueB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valueA > valueB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredSchedules, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const getSortArrow = (key) => {
    if (sortConfig.key !== key) return "";
    return sortConfig.direction === "asc" ? "▲" : "▼";
  };

  const metrics = useMemo(() => {
    const totalSlots = filteredSchedules.length;
    const booked = filteredSchedules.filter((s) => s.available === false).length;
    const available = filteredSchedules.filter((s) => s.available === true).length;
    const done = filteredSchedules.filter((s) => statusName(s) === "Concluido").length;
    return { totalSlots, booked, available, done };
  }, [filteredSchedules]);

  const finance = useMemo(() => summarizeRevenue(filteredSchedules), [filteredSchedules]);

  // Valor e comissão de uma linha: só existem para horários reservados
  const rowAmount = (item) => (item?.available === false ? formatMoney(bookingAmount(item)) : "-");
  const rowCommission = (item) =>
    item?.available === false && item?.professionalIsOwner === false ? formatMoney(bookingCommission(item)) : "-";
  const rowProfessional = (item) => item?.professionalName || "-";

  const exportCsv = () => {
    const now = formatNow();
    const fileDate = new Date().toISOString().slice(0, 10);

    const lines = [
      csvEscape("Relatorio Horario Certo"),
      `${csvEscape("Gerado em")};${csvEscape(now)}`,
      `${csvEscape("Empresa")};${csvEscape(companyInfo?.name || companyUrl || "-")}`,
      `${csvEscape("Periodo")};${csvEscape(`${fmtPeriodDate(startDate)} ate ${fmtPeriodDate(endDate)}`)}`,
      `${csvEscape("Total de horarios")};${csvEscape(metrics.totalSlots)}`,
      `${csvEscape("Agendados")};${csvEscape(metrics.booked)}`,
      `${csvEscape("Disponiveis")};${csvEscape(metrics.available)}`,
      `${csvEscape("Concluidos")};${csvEscape(metrics.done)}`,
      `${csvEscape(hasTeam ? "Faturamento (seus atendimentos)" : "Faturamento")};${csvEscape(formatMoney(finance.revenue))}`,
      ...(hasTeam
        ? [
            `${csvEscape("Parte do estabelecimento (atendimentos da equipe)")};${csvEscape(formatMoney(finance.commission))}`,
            `${csvEscape("Faturamento total")};${csvEscape(formatMoney(finance.total))}`,
          ]
        : []),
      "",
      [
        "Data",
        "Hora",
        "Status",
        "Servico",
        ...(hasTeam ? ["Profissional"] : []),
        "Valor",
        ...(hasTeam ? ["Parte do estabelecimento"] : []),
        "Cliente",
        "Telefone",
      ].map(csvEscape).join(";"),
    ];

    sortedSchedules.forEach((item) => {
      lines.push([
        fmtDate(item.schedule),
        fmtTime(item.schedule),
        statusName(item),
        item?.service?.name || "Sem servico",
        ...(hasTeam ? [rowProfessional(item)] : []),
        rowAmount(item),
        ...(hasTeam ? [rowCommission(item)] : []),
        item?.name || "-",
        item?.phone || "-",
      ].map(csvEscape).join(";"));
    });

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-horario-certo-${fileDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = async () => {
    const now = formatNow();
    const fileDate = new Date().toISOString().slice(0, 10);
    const logo = await getHorarioCertoLogo();
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    doc.setFillColor(246, 248, 246);
    doc.rect(0, 0, 210, 32, "F");

    if (logo) {
      doc.addImage(logo, "PNG", 14, 8, 12, 12);
    }

    doc.setTextColor(30, 44, 40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Horario Certo", 30, 13);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Relatorio de desempenho da agenda", 30, 19);

    doc.setFontSize(9);
    doc.text(`Data e hora de emissao: ${now}`, 14, 28);

    doc.setFontSize(10);
    doc.text(`Empresa: ${companyInfo?.name || companyUrl || "-"}`, 14, 40);
    doc.text(`Periodo: ${fmtPeriodDate(startDate)} ate ${fmtPeriodDate(endDate)}`, 14, 46);
    doc.text(
      `Totais - Horarios: ${metrics.totalSlots} | Agendados: ${metrics.booked} | Disponiveis: ${metrics.available} | Concluidos: ${metrics.done}`,
      14,
      52
    );
    doc.text(
      hasTeam
        ? `Seus atendimentos: ${formatMoney(finance.revenue)} | Parte do estabelecimento (equipe): ${formatMoney(finance.commission)} | Faturamento total: ${formatMoney(finance.total)}`
        : `Faturamento: ${formatMoney(finance.revenue)}`,
      14,
      58
    );

    const head = [
      "Data", "Hora", "Status", "Servico",
      ...(hasTeam ? ["Profissional"] : []),
      "Valor",
      ...(hasTeam ? ["Parte do estabelecimento"] : []),
      "Cliente", "Telefone",
    ];
    const rows = sortedSchedules.map((item) => ([
      fmtDate(item.schedule),
      fmtTime(item.schedule),
      statusName(item),
      item?.service?.name || "Sem servico",
      ...(hasTeam ? [rowProfessional(item)] : []),
      rowAmount(item),
      ...(hasTeam ? [rowCommission(item)] : []),
      item?.name || "-",
      item?.phone || "-",
    ]));

    autoTable(doc, {
      startY: 64,
      head: [head],
      body: rows.length ? rows : [head.map((_, i) => (i === 2 ? "Sem registros" : "-"))],
      styles: {
        fontSize: 8,
        cellPadding: 2.2,
      },
      headStyles: {
        fillColor: [30, 44, 40],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 248],
      },
    });

    doc.save(`relatorio-horario-certo-${fileDate}.pdf`);
  };

  return (
    <>
      {companyInfo && (
            <PageLayout
              title="Relatórios"
              subtitle={`Filtros de período, status e serviço com exportação para PDF e CSV. Período atual: ${fmtPeriodDate(startDate)} até ${fmtPeriodDate(endDate)}.`}
              actions={
                    <Actions>
                      <Btn type="button" onClick={exportCsv} disabled={loading}>
                        <FileSpreadsheet size={16} />
                        Exportar CSV
                      </Btn>
                      <Btn type="button" $primary onClick={exportPdf} disabled={loading}>
                        <FileText size={16} />
                        Exportar PDF
                      </Btn>
                    </Actions>
              }
            >
                <PageWrapper>

                  <FiltersCard>
                    <Actions style={{ marginBottom: "0.6rem" }}>
                      <Filter size={15} />
                      <strong style={{ fontSize: "0.85rem" }}>Filtros</strong>
                    </Actions>
                    <FiltersGrid>
                      <Field>
                        Periodo
                        <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
                          <option value="7">Ultimos 7 dias</option>
                          <option value="15">Ultimos 15 dias</option>
                          <option value="30">Ultimos 30 dias</option>
                          <option value="custom">Personalizado</option>
                        </Select>
                      </Field>

                      <Field>
                        Data inicial
                        <Input
                          type="date"
                          value={startDate}
                          max={endDate}
                          onChange={(e) => {
                            setPeriod("custom");
                            setStartDate(e.target.value);
                          }}
                        />
                      </Field>

                      <Field>
                        Data final
                        <Input
                          type="date"
                          value={endDate}
                          min={startDate}
                          onChange={(e) => {
                            setPeriod("custom");
                            setEndDate(e.target.value);
                          }}
                        />
                      </Field>

                      <Field>
                        Status
                        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                          <option value="todos">Todos</option>
                          <option value="disponivel">Disponivel</option>
                          <option value="agendado">Agendado</option>
                          <option value="concluido">Concluido</option>
                          <option value="expirado">Expirado</option>
                        </Select>
                      </Field>

                      <Field>
                        Servico
                        <Select value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)}>
                          <option value="todos">Todos os servicos</option>
                          {serviceOptions.map((name) => (
                            <option key={name} value={name}>{name}</option>
                          ))}
                        </Select>
                      </Field>
                    </FiltersGrid>
                  </FiltersCard>

                  <SummaryGrid>
                    <SummaryCard>
                      <SummaryLabel>Total de horarios</SummaryLabel>
                      <SummaryValue>{loading ? "-" : metrics.totalSlots}</SummaryValue>
                    </SummaryCard>
                    <SummaryCard>
                      <SummaryLabel>Agendados</SummaryLabel>
                      <SummaryValue>{loading ? "-" : metrics.booked}</SummaryValue>
                    </SummaryCard>
                    <SummaryCard>
                      <SummaryLabel>Disponiveis</SummaryLabel>
                      <SummaryValue>{loading ? "-" : metrics.available}</SummaryValue>
                    </SummaryCard>
                    <SummaryCard>
                      <SummaryLabel>Concluidos</SummaryLabel>
                      <SummaryValue>{loading ? "-" : metrics.done}</SummaryValue>
                    </SummaryCard>
                  </SummaryGrid>

                  <SummaryGrid style={{ marginTop: "0.85rem" }}>
                    <SummaryCard>
                      <SummaryLabel>{hasTeam ? "Faturamento (seus atendimentos)" : "Faturamento"}</SummaryLabel>
                      <SummaryValue>{loading ? "-" : formatMoney(finance.revenue)}</SummaryValue>
                    </SummaryCard>
                    {hasTeam && (
                      <>
                        <SummaryCard>
                          <SummaryLabel>Parte do estabelecimento (equipe)</SummaryLabel>
                          <SummaryValue>{loading ? "-" : formatMoney(finance.commission)}</SummaryValue>
                        </SummaryCard>
                        <SummaryCard>
                          <SummaryLabel>Faturamento total</SummaryLabel>
                          <SummaryValue>{loading ? "-" : formatMoney(finance.total)}</SummaryValue>
                        </SummaryCard>
                      </>
                    )}
                  </SummaryGrid>

                  <TableWrap>
                    <TableScroll>
                      <Table>
                        <thead>
                          <tr>
                            <th>
                              <SortHeaderButton type="button" onClick={() => handleSort("date")}>Data {getSortArrow("date")}</SortHeaderButton>
                            </th>
                            <th>
                              <SortHeaderButton type="button" onClick={() => handleSort("time")}>Hora {getSortArrow("time")}</SortHeaderButton>
                            </th>
                            <th>
                              <SortHeaderButton type="button" onClick={() => handleSort("status")}>Status {getSortArrow("status")}</SortHeaderButton>
                            </th>
                            <th>
                              <SortHeaderButton type="button" onClick={() => handleSort("service")}>Servico {getSortArrow("service")}</SortHeaderButton>
                            </th>
                            {hasTeam && <th>Profissional</th>}
                            <th>Valor</th>
                            {hasTeam && <th title="Quanto fica com o estabelecimento nos atendimentos da equipe">Parte do estabelecimento</th>}
                            <th>
                              <SortHeaderButton type="button" onClick={() => handleSort("name")}>Cliente {getSortArrow("name")}</SortHeaderButton>
                            </th>
                            <th>
                              <SortHeaderButton type="button" onClick={() => handleSort("phone")}>Telefone {getSortArrow("phone")}</SortHeaderButton>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {!loading && sortedSchedules.length === 0 && (
                            <tr>
                              <td colSpan={hasTeam ? 9 : 7} style={{ padding: 0 }}>
                                <EmptyState>Nenhum registro para os filtros selecionados.</EmptyState>
                              </td>
                            </tr>
                          )}
                          {!loading && sortedSchedules.map((item, idx) => (
                            <tr key={`${item?.id || idx}-${item?.schedule || ""}`}>
                              <td>{fmtDate(item.schedule)}</td>
                              <td>{fmtTime(item.schedule)}</td>
                              <td>{statusName(item)}</td>
                              <td>{item?.service?.name || "Sem servico"}</td>
                              {hasTeam && <td>{rowProfessional(item)}</td>}
                              <td>{rowAmount(item)}</td>
                              {hasTeam && <td>{rowCommission(item)}</td>}
                              <td>{item?.name || "-"}</td>
                              <td>{item?.phone || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </TableScroll>

                    {loading && <EmptyState>Carregando relatorio...</EmptyState>}
                  </TableWrap>

                  <Actions>
                    <Btn type="button" onClick={exportCsv} disabled={loading}>
                      <Download size={16} />
                      Baixar CSV
                    </Btn>
                    <Btn type="button" $primary onClick={exportPdf} disabled={loading}>
                      <Download size={16} />
                      Baixar PDF
                    </Btn>
                  </Actions>
                </PageWrapper>
            </PageLayout>
      )}
    </>
  );
}
