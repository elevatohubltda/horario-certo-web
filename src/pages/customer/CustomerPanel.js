import React, { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { CalendarClock, Clock, ExternalLink, RefreshCw, Scissors, User, UserCog, XCircle } from "lucide-react";
import CustomerLayout, { Content } from "../../components/customer/CustomerLayout";
import {
  Badge, Button, Card, Field, FieldHint, FormGrid, Input, Message, Modal, PageHeader, errorMessage, formatMoney,
} from "../../components/admin";
import {
  cancelCustomerAppointment, getCustomerAppointments, updateCustomerMe,
} from "../../services/endpoints/customer";
import { setCurrentCustomer, useCustomer } from "../../util/customerSession";
import { formataNumeroTelefone } from "../../util/format";
import { isMobile } from "../../util/util";

const Tabs = styled.div`
  display: inline-flex;
  gap: 0.25rem;
  padding: 0.25rem;
  margin-bottom: 1rem;
  border-radius: 999px;
  background: #fff;
  border: 1px solid var(--ui-border);
`;

const Tab = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  height: 34px;
  padding: 0 1rem;
  border: none;
  border-radius: 999px;
  background: ${(p) => (p.$active ? "var(--ui-primary)" : "transparent")};
  color: ${(p) => (p.$active ? "#fff" : "var(--ui-text-secondary)")};
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;

  span {
    font-size: 0.75rem;
    opacity: 0.75;
  }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const AppointmentCard = styled(Card)`
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: center;
  padding: 1.1rem 1.25rem;

  @media (max-width: 720px) {
    grid-template-columns: 44px minmax(0, 1fr);

    > .actions {
      grid-column: 1 / -1;
    }
  }
`;

const Avatar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #f3f4f6 center / cover no-repeat;
  background-image: ${(p) => (p.$src ? `url("${p.$src}")` : "none")};
  border: 1px solid var(--ui-border);
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--ui-text);

  @media (max-width: 720px) {
    width: 44px;
    height: 44px;
  }
`;

const Info = styled.div`
  min-width: 0;

  .top {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: var(--ui-text);
  }
`;

const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 1rem;
  margin-top: 0.4rem;
  font-size: 0.82rem;
  color: var(--ui-text-secondary);

  span {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
  }

  svg {
    color: var(--ui-muted);
  }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;

  @media (max-width: 720px) {
    justify-content: flex-start;
  }
`;

const DangerOutline = styled(Button)`
  background: #fff;
  color: var(--ui-danger);
  border-color: #fecaca;
`;

const Note = styled.p`
  margin: 0.4rem 0 0;
  font-size: 0.75rem;
  color: var(--ui-muted);
`;

const Empty = styled(Card)`
  padding: 2.5rem 1.5rem;
  text-align: center;

  h3 {
    margin: 0.75rem 0 0.35rem;
    font-size: 1rem;
    font-weight: 700;
  }

  p {
    margin: 0;
    font-size: 0.875rem;
    color: var(--ui-muted);
  }

  svg {
    color: var(--ui-muted);
  }
`;

const WEEKDAYS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

// "2026-11-03T10:00:00" -> "terça, 03/11/2026 às 10:00" (horário já vem no fuso da empresa)
const formatSchedule = (value) => {
  const [date, time = ""] = value.split("T");
  const [year, month, day] = date.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(year, month - 1, day).getDay()];
  return `${weekday}, ${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year} às ${time.slice(0, 5)}`;
};

const initials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

export default function CustomerPanel() {
  const navigate = useNavigate();
  const mobile = isMobile();
  const { customer, loading: loadingCustomer } = useCustomer();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("upcoming");
  const [toCancel, setToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState({ name: "", telephone: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!loadingCustomer && !customer) navigate("/area-do-cliente/entrar", { replace: true });
  }, [customer, loadingCustomer, navigate]);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getCustomerAppointments();
      setAppointments(response.data || []);
    } catch (error) {
      toast.error(errorMessage(error, "Não foi possível carregar seus agendamentos."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (customer) fetchAppointments();
  }, [customer, fetchAppointments]);

  const upcoming = useMemo(
    // Próximos em ordem cronológica; o histórico continua do mais recente para o mais antigo
    () => appointments.filter((a) => a.status === "UPCOMING").sort((a, b) => a.schedule.localeCompare(b.schedule)),
    [appointments]
  );
  const history = useMemo(() => appointments.filter((a) => a.status !== "UPCOMING"), [appointments]);
  const visible = tab === "upcoming" ? upcoming : history;

  const openAgenda = (appointment) => navigate(`/${appointment.companyUrl}`);

  const startReschedule = (appointment) =>
    navigate(`/${appointment.companyUrl}`, { state: { reschedule: appointment } });

  const confirmCancel = async () => {
    setCancelling(true);
    try {
      await cancelCustomerAppointment(toCancel.id);
      toast.success("Agendamento cancelado.");
      setToCancel(null);
      fetchAppointments();
    } catch (error) {
      toast.error(errorMessage(error, "Não foi possível cancelar o agendamento."));
    } finally {
      setCancelling(false);
    }
  };

  const openProfile = () => {
    setProfile({ name: customer.name, telephone: formataNumeroTelefone(customer.telephone || "") });
    setProfileOpen(true);
  };

  const saveProfile = async () => {
    const digits = profile.telephone.replace(/\D/g, "");
    if (digits && digits.length < 11) {
      toast.error("Informe o WhatsApp com DDD.");
      return;
    }
    setSavingProfile(true);
    try {
      const response = await updateCustomerMe({ name: profile.name, telephone: digits || null });
      setCurrentCustomer(response.data);
      toast.success("Dados atualizados.");
      setProfileOpen(false);
    } catch (error) {
      toast.error(errorMessage(error, "Não foi possível salvar seus dados."));
    } finally {
      setSavingProfile(false);
    }
  };

  if (loadingCustomer || !customer) {
    return (
      <CustomerLayout>
        <Content><Message>Carregando...</Message></Content>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout customer={customer}>
      <Content>
        <PageHeader
          title="Meus agendamentos"
          subtitle={`Olá, ${customer.name.split(" ")[0]}! Aqui ficam os seus horários em todas as barbearias.`}
          actions={
            <Button $variant="outline" type="button" onClick={openProfile}>
              <UserCog size={14} /> Meus dados
            </Button>
          }
        />

        <Tabs role="tablist">
          <Tab type="button" $active={tab === "upcoming"} onClick={() => setTab("upcoming")}>
            Próximos <span>{upcoming.length}</span>
          </Tab>
          <Tab type="button" $active={tab === "history"} onClick={() => setTab("history")}>
            Histórico <span>{history.length}</span>
          </Tab>
        </Tabs>

        {loading ? (
          <Message>Carregando agendamentos...</Message>
        ) : visible.length === 0 ? (
          <Empty>
            <CalendarClock size={32} />
            <h3>{tab === "upcoming" ? "Nenhum agendamento marcado" : "Nenhum atendimento no histórico"}</h3>
            <p>
              {tab === "upcoming"
                ? "Os horários que você marcar logado na sua conta aparecem aqui."
                : "Seus atendimentos concluídos vão aparecer aqui."}
            </p>
          </Empty>
        ) : (
          <List>
            {visible.map((appointment) => {
              const isUpcoming = appointment.status === "UPCOMING";
              return (
                <AppointmentCard key={appointment.id}>
                  <Avatar $src={appointment.companyImage}>
                    {!appointment.companyImage && initials(appointment.companyName)}
                  </Avatar>
                  <Info>
                    <div className="top">
                      <h3>{appointment.companyName}</h3>
                      <Badge $tone={isUpcoming ? "green" : "gray"}>{isUpcoming ? "Agendado" : "Concluído"}</Badge>
                    </div>
                    <Meta>
                      <span><CalendarClock size={14} /> {formatSchedule(appointment.schedule)}</span>
                      {appointment.serviceName && (
                        <span><Scissors size={14} /> {appointment.serviceName}</span>
                      )}
                      {appointment.professionalName && (
                        <span><User size={14} /> {appointment.professionalName}</span>
                      )}
                      <span><Clock size={14} /> {appointment.durationMinutes} min</span>
                      {appointment.amount != null && <span>{formatMoney(appointment.amount)}</span>}
                    </Meta>
                    {isUpcoming && !appointment.canChange && (
                      <Note>
                        Alterações só até {appointment.cancelLimitMinutes} minutos antes do horário. Fale direto com a barbearia.
                      </Note>
                    )}
                  </Info>
                  <Actions className="actions">
                    {isUpcoming && appointment.canChange && (
                      <>
                        <Button $variant="outline" type="button" onClick={() => startReschedule(appointment)}>
                          <RefreshCw size={14} /> Remarcar
                        </Button>
                        <DangerOutline type="button" onClick={() => setToCancel(appointment)}>
                          <XCircle size={14} /> Cancelar
                        </DangerOutline>
                      </>
                    )}
                    <Button type="button" onClick={() => openAgenda(appointment)} disabled={!appointment.companyUrl}>
                      <ExternalLink size={14} /> Acessar agenda
                    </Button>
                  </Actions>
                </AppointmentCard>
              );
            })}
          </List>
        )}
      </Content>

      <Modal
        open={!!toCancel}
        title="Cancelar agendamento"
        onClose={() => setToCancel(null)}
        footer={
          <>
            <Button $variant="outline" type="button" onClick={() => setToCancel(null)}>Voltar</Button>
            <Button $variant="danger" type="button" onClick={confirmCancel} disabled={cancelling}>
              {cancelling ? "Cancelando..." : "Cancelar agendamento"}
            </Button>
          </>
        }
      >
        {toCancel && (
          <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.5, color: "var(--ui-text-secondary)" }}>
            Cancelar <strong>{toCancel.serviceName || "o atendimento"}</strong> na <strong>{toCancel.companyName}</strong>,{" "}
            {formatSchedule(toCancel.schedule)}? O horário fica livre para outros clientes.
          </p>
        )}
      </Modal>

      <Modal
        open={profileOpen}
        title="Meus dados"
        onClose={() => setProfileOpen(false)}
        footer={
          <>
            <Button $variant="outline" type="button" onClick={() => setProfileOpen(false)}>Cancelar</Button>
            <Button type="button" onClick={saveProfile} disabled={savingProfile || !profile.name.trim()}>
              {savingProfile ? "Salvando..." : "Salvar"}
            </Button>
          </>
        }
      >
        <FormGrid>
          <Field>
            Nome
            <Input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
          </Field>
          <Field>
            WhatsApp
            <Input
              value={profile.telephone}
              placeholder="(00) 0 0000-0000"
              onChange={(e) => setProfile((p) => ({ ...p, telephone: formataNumeroTelefone(e.target.value) }))}
            />
          </Field>
        </FormGrid>
        <FieldHint style={{ display: "block", marginTop: "0.75rem" }}>
          E-mail da conta: {customer.email}{customer.googleLinked ? " (conectado ao Google)" : ""}
        </FieldHint>
      </Modal>

      <ToastContainer position={mobile ? "bottom-center" : "top-right"} autoClose={3000} />
    </CustomerLayout>
  );
}
