import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { CalendarDays, Lock, LockOpen, MessageCircle } from "lucide-react";
import {
  AdminLayout,
  Badge,
  Card,
  Field,
  FilterBar,
  IconButton,
  Input,
  Message,
  Muted,
  Select,
  SummaryGrid,
  SummaryLabel,
  SummaryValue,
  Table,
  TableCard,
  errorMessage,
  formatDate,
  formatMoney,
} from "../components/admin";
import { blockClientAccess, getAdminClients, releaseClientAccess } from "../services/endpoints/admin";

const STATUS = {
  TESTE: { label: "Em teste", tone: "blue" },
  EM_DIA: { label: "Em dia", tone: "green" },
  VENCE_HOJE: { label: "Vence hoje", tone: "yellow" },
  EM_ATRASO: { label: "Em atraso", tone: "yellow" },
  BLOQUEADO: { label: "Bloqueado (pagamento)", tone: "red" },
  BLOQUEADO_MANUAL: { label: "Bloqueado manual", tone: "red" },
  LIBERADO_MANUAL: { label: "Liberado manual", tone: "purple" },
  GRATUITO: { label: "Gratuito", tone: "gray" },
};

// Quem conta como receita recorrente: está pagando ou deveria estar
const REVENUE_STATUSES = ["EM_DIA", "VENCE_HOJE", "EM_ATRASO", "LIBERADO_MANUAL"];
// Liberar só faz sentido para quem está bloqueado ou com pagamento pendente
const RELEASABLE_STATUSES = ["BLOQUEADO", "BLOQUEADO_MANUAL", "EM_ATRASO", "VENCE_HOJE"];

const whatsappLink = (whatsapp) => {
  const digits = (whatsapp || "").replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits.startsWith("55") ? digits : `55${digits}`}`;
};

function AdminClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [filters, setFilters] = useState({ search: "", status: "", plan: "", coupon: "" });

  const fetchClients = useCallback(async () => {
    try {
      const response = await getAdminClients();
      setClients(response.data);
      setError(null);
    } catch (err) {
      setError(errorMessage(err, "Não foi possível carregar os clientes."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const plans = useMemo(() => [...new Set(clients.map((c) => c.planName))].sort(), [clients]);
  const coupons = useMemo(
    () => [...new Set(clients.map((c) => c.discountCode).filter(Boolean))].sort(),
    [clients]
  );

  const filtered = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return clients.filter((c) => {
      if (search) {
        const haystack = [c.companyName, c.companyUrl, c.ownerUsername, c.email, c.whatsapp]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      if (filters.status && c.status !== filters.status) return false;
      if (filters.plan && c.planName !== filters.plan) return false;
      if (filters.coupon === "__with" && !c.discountCode) return false;
      if (filters.coupon === "__without" && c.discountCode) return false;
      if (filters.coupon && !filters.coupon.startsWith("__") && c.discountCode !== filters.coupon) return false;
      return true;
    });
  }, [clients, filters]);

  const summary = useMemo(() => {
    const paying = clients.filter((c) => REVENUE_STATUSES.includes(c.status));
    return {
      total: clients.length,
      trial: clients.filter((c) => c.status === "TESTE").length,
      attention: clients.filter((c) => ["EM_ATRASO", "BLOQUEADO", "BLOQUEADO_MANUAL"].includes(c.status)).length,
      revenue: paying.reduce((sum, c) => sum + Number(c.monthlyAmount || 0), 0),
    };
  }, [clients]);

  const setFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  const handleAccess = async (client, action) => {
    const question =
      action === "block"
        ? `Bloquear o acesso de "${client.companyName}"? A agenda e o painel ficam indisponíveis até você liberar, mesmo que o pagamento esteja em dia.`
        : `Liberar o acesso de "${client.companyName}"? Fica liberado mesmo em atraso, até o próximo pagamento confirmado.`;
    if (!window.confirm(question)) return;

    setBusyId(client.companyId);
    try {
      if (action === "block") {
        await blockClientAccess(client.companyId);
        toast.success("Acesso bloqueado");
      } else {
        await releaseClientAccess(client.companyId);
        toast.success("Acesso liberado");
      }
      await fetchClients();
    } catch (err) {
      toast.error(errorMessage(err, "Não foi possível alterar o acesso."));
    } finally {
      setBusyId(null);
    }
  };

  const openContact = (client) => {
    const link = whatsappLink(client.whatsapp);
    if (link) {
      window.open(link, "_blank", "noopener");
    } else if (client.email) {
      window.location.href = `mailto:${client.email}`;
    }
  };

  return (
    <AdminLayout title="Clientes" subtitle="Assinantes, situação de pagamento e controle de acesso.">
      {loading ? (
        <Message>Carregando...</Message>
      ) : error ? (
        <Message>{error}</Message>
      ) : (
        <>
          <SummaryGrid>
            <Card>
              <SummaryLabel>Clientes</SummaryLabel>
              <SummaryValue>{summary.total}</SummaryValue>
            </Card>
            <Card>
              <SummaryLabel>Em teste grátis</SummaryLabel>
              <SummaryValue>{summary.trial}</SummaryValue>
            </Card>
            <Card>
              <SummaryLabel>Em atraso ou bloqueados</SummaryLabel>
              <SummaryValue $color={summary.attention > 0 ? "#dc2626" : undefined}>{summary.attention}</SummaryValue>
            </Card>
            <Card>
              <SummaryLabel>Receita mensal (pagantes)</SummaryLabel>
              <SummaryValue>{formatMoney(summary.revenue)}</SummaryValue>
            </Card>
          </SummaryGrid>

          <FilterBar>
            <Field>
              Buscar
              <Input
                placeholder="Nome, link, usuário, e-mail ou WhatsApp"
                value={filters.search}
                onChange={(e) => setFilter("search", e.target.value)}
              />
            </Field>
            <Field>
              Status
              <Select value={filters.status} onChange={(e) => setFilter("status", e.target.value)}>
                <option value="">Todos</option>
                {Object.entries(STATUS).map(([value, { label }]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            </Field>
            <Field>
              Plano
              <Select value={filters.plan} onChange={(e) => setFilter("plan", e.target.value)}>
                <option value="">Todos</option>
                {plans.map((plan) => (
                  <option key={plan} value={plan}>{plan}</option>
                ))}
              </Select>
            </Field>
            <Field>
              Cupom
              <Select value={filters.coupon} onChange={(e) => setFilter("coupon", e.target.value)}>
                <option value="">Todos</option>
                <option value="__with">Com cupom</option>
                <option value="__without">Sem cupom</option>
                {coupons.map((coupon) => (
                  <option key={coupon} value={coupon}>{coupon}</option>
                ))}
              </Select>
            </Field>
          </FilterBar>

          {filtered.length === 0 ? (
            <Message>Nenhum cliente encontrado com esses filtros.</Message>
          ) : (
            <TableCard>
              <Table $minWidth="900px">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Status</th>
                    <th>Plano</th>
                    <th>Mensalidade</th>
                    <th>Pagamento</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((client) => {
                    const status = STATUS[client.status] || { label: client.status, tone: "gray" };
                    const canContact = Boolean(whatsappLink(client.whatsapp) || client.email);
                    const busy = busyId === client.companyId;
                    return (
                      <tr key={client.companyId}>
                        <td>
                          <strong>{client.companyName}</strong>
                          <Muted>
                            {client.companyUrl} · {client.ownerUsername}
                          </Muted>
                          <Muted>Cliente desde {formatDate(client.createdAt)}</Muted>
                        </td>
                        <td>
                          <Badge $tone={status.tone}>{status.label}</Badge>
                          {client.statusMessage && <Muted style={{ maxWidth: 220 }}>{client.statusMessage}</Muted>}
                        </td>
                        <td>
                          {client.planName}
                          <Muted>{formatMoney(client.planPrice)}</Muted>
                        </td>
                        <td>
                          <strong>{formatMoney(client.monthlyAmount)}</strong>
                          {client.discountCode && (
                            <div style={{ marginTop: "0.3rem" }}>
                              <Badge $tone="purple" title={client.discountDisplay}>
                                {client.discountDisplay || client.discountCode}
                              </Badge>
                            </div>
                          )}
                        </td>
                        <td>
                          {client.paymentMethod === "CARD" ? "Cartão" : "Pix"}
                          <Muted>Último: {formatDate(client.lastPaymentDate)}</Muted>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "0.35rem" }}>
                            <IconButton
                              title={client.whatsapp ? "Contato pelo WhatsApp" : "Contato por e-mail"}
                              onClick={() => openContact(client)}
                              disabled={!canContact}
                              $color="#16a34a"
                            >
                              <MessageCircle size={16} />
                            </IconButton>
                            <IconButton
                              title="Acessar agenda"
                              onClick={() => window.open(`/${client.companyUrl}`, "_blank", "noopener")}
                              disabled={!client.companyUrl}
                            >
                              <CalendarDays size={16} />
                            </IconButton>
                            <IconButton
                              title="Bloquear acesso manualmente"
                              onClick={() => handleAccess(client, "block")}
                              disabled={busy || client.status === "BLOQUEADO_MANUAL"}
                              $color="#dc2626"
                            >
                              <Lock size={16} />
                            </IconButton>
                            <IconButton
                              title="Liberar acesso manualmente"
                              onClick={() => handleAccess(client, "release")}
                              disabled={busy || !RELEASABLE_STATUSES.includes(client.status)}
                              $color="#2563eb"
                            >
                              <LockOpen size={16} />
                            </IconButton>
                          </div>
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

export default AdminClients;
