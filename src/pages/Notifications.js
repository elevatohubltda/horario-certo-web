import React, { useEffect, useState } from "react";
import styled from "styled-components";
import "../styles/index.css";
import { Clock } from "lucide-react";
import { Message, Notice, PageLayout } from "../components/admin";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { isAvailableLogin, redirectToLogin } from "../util/auth";
import { toast } from "react-toastify";
import { getNotificationSettings, updateNotificationSettings } from "../services/endpoints/notifications";

const NoticeLink = styled.button`
  margin-top: 0.35rem;
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  font-weight: 600;
  color: var(--ui-primary);
  text-decoration: underline;
  cursor: pointer;
`;

const hasWhatsAppFeature = (feature) =>
  feature.name.toLowerCase().includes("whatsapp");

/* ── Toggle iOS ─────────────────────────────────── */
const ToggleLabel = styled.label`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 28px;
  cursor: pointer;
  flex-shrink: 0;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
`;

const ToggleSlider = styled.span`
  position: absolute;
  inset: 0;
  background-color: ${({ $on }) => ($on ? "#4CD964" : "#ccc")};
  border-radius: 28px;
  transition: background-color 0.25s;

  &::before {
    content: "";
    position: absolute;
    width: 22px;
    height: 22px;
    left: 3px;
    bottom: 3px;
    background: white;
    border-radius: 50%;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
    transition: transform 0.25s;
    transform: ${({ $on }) => ($on ? "translateX(20px)" : "translateX(0)")};
  }
`;

/* ── Card colapsável ─────────────────────────────── */
const Card = styled.div`
  background: #fff;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
  box-shadow: var(--ui-card-shadow);
  margin-bottom: 1rem;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.2rem;
  cursor: pointer;
  background: #fff;
  border-radius: ${({ $open }) => ($open ? "var(--ui-radius) var(--ui-radius) 0 0" : "var(--ui-radius)")};
  user-select: none;
`;

// Formulário dentro do card: sem o visual de card próprio
const InnerForm = styled.form`
  padding: 0;
  box-shadow: none;
  border-radius: 0;
  background: transparent;
`;

const CardHeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const CardTitle = styled.span`
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--ui-text);
`;

const CardSubtitle = styled.span`
  font-size: 0.75rem;
  color: ${({ $on }) => ($on ? "#16a34a" : "var(--ui-muted)")};
`;

const CollapsibleBody = styled.div`
  max-height: ${({ $open }) => ($open ? "400px" : "0")};
  overflow: hidden;
  border-radius: 0 0 12px 12px;
  transition: max-height 0.3s ease;
`;

const CardBody = styled.div`
  padding: 1.2rem;
  border-top: 1px solid var(--ui-border);
  background: #fff;
  border-radius: 0 0 var(--ui-radius) var(--ui-radius);
`;

/* ── Campo com tooltip ───────────────────────────── */
const FieldRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 0.4rem;
`;

const FieldLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--ui-text-secondary);
`;

const TooltipWrapper = styled.div`
  position: relative;
  display: inline-flex;

  &:hover > span {
    visibility: visible;
    opacity: 1;
  }
`;

const TooltipBubble = styled.span`
  visibility: hidden;
  opacity: 0;
  width: 230px;
  background: #333;
  color: #fff;
  font-size: 0.72rem;
  line-height: 1.45;
  border-radius: 6px;
  padding: 8px 10px;
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 200;
  transition: opacity 0.18s;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);

  &::after {
    content: "";
    position: absolute;
    bottom: 100%;
    left: 8px;
    border: 5px solid transparent;
    border-bottom-color: #333;
  }
`;

const QuestionBtn = styled.button`
  background: var(--ui-muted);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 15px;
  height: 15px;
  font-size: 9px;
  font-weight: 700;
  cursor: default;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  line-height: 1;
`;

/* ── Input e botão ───────────────────────────────── */
const NumberInput = styled.input`
  padding: 0.5rem 0.6rem;
  border: 1px solid var(--ui-input-border);
  border-radius: var(--ui-radius-sm);
  background: #fff;
  color: var(--ui-text);
  font-size: 0.85rem;
  margin-top: 0.2rem;
  margin-bottom: 1rem;
  max-width: 160px;

  &:focus {
    outline: none;
    border-color: var(--ui-primary);
  }
`;

const SaveButton = styled.button`
  background-color: var(--ui-primary);
  color: #fff;
  border: 1px solid var(--ui-primary);
  border-radius: 999px;
  padding: 0.45rem 0.95rem;
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;

  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.6; cursor: default; }
`;

/* ── Acesso negado ───────────────────────────────── */
const AccessDenied = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1rem;
  gap: 1rem;
  text-align: center;
  color: var(--ui-muted);
  font-size: 0.9rem;
  background: #fff;
  border-radius: var(--ui-radius);
  box-shadow: var(--ui-card-shadow);
`;

/* ── Helpers ─────────────────────────────────────── */
function Tooltip({ text }) {
  return (
    <TooltipWrapper>
      <QuestionBtn type="button" tabIndex={-1}>?</QuestionBtn>
      <TooltipBubble>{text}</TooltipBubble>
    </TooltipWrapper>
  );
}

function NotificationCard({ title, subtitle, enabled, onToggle, children }) {
  return (
    <Card $on={enabled}>
      <CardHeader $on={enabled} $open={enabled} onClick={onToggle}>
        <CardHeaderLeft>
          <CardTitle>{title}</CardTitle>
          <CardSubtitle $on={enabled}>{enabled ? "Ativado" : "Desativado"}</CardSubtitle>
        </CardHeaderLeft>
        <ToggleLabel onClick={(e) => e.stopPropagation()}>
          <ToggleInput
            type="checkbox"
            checked={enabled}
            onChange={onToggle}
            readOnly
          />
          <ToggleSlider $on={enabled} />
        </ToggleLabel>
      </CardHeader>

      <CollapsibleBody $open={enabled}>
        <CardBody>{children}</CardBody>
      </CollapsibleBody>
    </Card>
  );
}

/* ── Página principal ────────────────────────────── */
export default function Notifications() {
  const companyUrl = Cookies.get("companyUrl");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  const [retentionEnabled, setRetentionEnabled] = useState(false);
  const [retentionDays, setRetentionDays] = useState(3);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderHours, setReminderHours] = useState(2);
  // false no teste grátis: dá para configurar, mas o envio só começa após a primeira mensalidade
  const [whatsappAvailable, setWhatsappAvailable] = useState(true);

  useEffect(() => {
    if (!isAvailableLogin()) {
      redirectToLogin(navigate);
      return;
    }
    loadPage();
    // eslint-disable-next-line
  }, []);

  const loadPage = async () => {
    try {
      const stored = Cookies.get("companyFeatures");
      const features = stored ? JSON.parse(stored) : [];
      const allowed = features.some(hasWhatsAppFeature);
      setHasAccess(allowed);

      if (allowed) {
        const res = await getNotificationSettings(companyUrl);
        if (res.status === 200) {
          setRetentionEnabled(res.data.enabled);
          setRetentionDays(res.data.daysBefore);
          setReminderEnabled(res.data.reminderEnabled);
          setReminderHours(res.data.reminderHoursBefore);
          setWhatsappAvailable(res.data.whatsappAvailable !== false);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const buildPayload = () => ({
    enabled: retentionEnabled,
    daysBefore: parseInt(retentionDays, 10),
    reminderEnabled,
    reminderHoursBefore: parseInt(reminderHours, 10),
  });

  const handleSaveRetention = async (e) => {
    e.preventDefault();
    const days = parseInt(retentionDays, 10);
    if (isNaN(days) || days < 1 || days > 30) {
      toast.error("Informe um valor entre 1 e 30 dias");
      return;
    }
    setSaving(true);
    try {
      const res = await updateNotificationSettings(companyUrl, buildPayload());
      if (res.status === 200) {
        toast.success("Preferências de notificações salvas com sucesso!");
      } else {
        toast.error("Erro ao salvar configurações");
      }
    } catch {
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveReminder = async (e) => {
    e.preventDefault();
    const hours = parseInt(reminderHours, 10);
    if (isNaN(hours) || hours < 1 || hours > 48) {
      toast.error("Informe um valor entre 1 e 48 horas");
      return;
    }
    setSaving(true);
    try {
      const res = await updateNotificationSettings(companyUrl, buildPayload());
      if (res.status === 200) {
        toast.success("Preferências de notificações salvas com sucesso!");
      } else {
        toast.error("Erro ao salvar configurações");
      }
    } catch {
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageLayout
      title="Notificações"
      subtitle="Mensagens automáticas no WhatsApp para seus clientes voltarem e não esquecerem o horário."
    >
          {loading ? (
            <Message>Carregando...</Message>
          ) : !hasAccess ? (
            <AccessDenied>
              <span style={{ fontSize: "2rem" }}>🔒</span>
              <strong>Acesso restrito</strong>
              <span>
                Esta funcionalidade está disponível apenas para assinantes do
                plano <strong>Whatsapp Básico</strong> ou{" "}
                <strong>Whatsapp Plus</strong>.
              </span>
              <SaveButton type="button" onClick={() => navigate("/assinatura")}>
                Ver planos
              </SaveButton>
            </AccessDenied>
          ) : (
            <>
              {!whatsappAvailable && (
                <Notice>
                  <Clock size={18} />
                  <span>
                    <strong>As mensagens começam após a primeira mensalidade.</strong> Durante o teste grátis seus clientes não recebem confirmação, lembrete nem mensagem de retorno pelo WhatsApp. Assim que o pagamento da primeira mensalidade for confirmado, o envio começa automaticamente. Você já pode deixar tudo configurado.
                    <br />
                    <NoticeLink type="button" onClick={() => navigate("/assinatura")}>
                      Não quer esperar? Assine agora
                    </NoticeLink>
                  </span>
                </Notice>
              )}
              <div>
                <NotificationCard
                  title="Notificação de retorno"
                  subtitle={retentionEnabled ? "Ativado" : "Desativado"}
                  enabled={retentionEnabled}
                  onToggle={() => setRetentionEnabled((v) => !v)}
                >
                  <InnerForm onSubmit={handleSaveRetention}>
                    <FieldRow>
                      <Tooltip text="O sistema calcula a média de dias entre os agendamentos do cliente. X dias antes da data prevista para o próximo serviço, ele recebe uma mensagem via WhatsApp caso não tenha nenhum agendamento futuro." />
                      <FieldLabel htmlFor="retention-days">
                        Dias de antecedência para notificar:
                      </FieldLabel>
                    </FieldRow>

                    <NumberInput
                      id="retention-days"
                      type="number"
                      min={1}
                      max={30}
                      value={retentionDays}
                      onChange={(e) => setRetentionDays(e.target.value)}
                    />

                    <div>
                      <SaveButton type="submit" disabled={saving}>
                        {saving ? "Salvando..." : "Salvar"}
                      </SaveButton>
                    </div>
                  </InnerForm>
                </NotificationCard>

                <NotificationCard
                  title="Lembrete de agendamento"
                  subtitle={reminderEnabled ? "Ativado" : "Desativado"}
                  enabled={reminderEnabled}
                  onToggle={() => setReminderEnabled((v) => !v)}
                >
                  <InnerForm onSubmit={handleSaveReminder}>
                    <FieldRow>
                      <Tooltip text="Envia uma mensagem via WhatsApp para o cliente X horas antes do horário agendado. Útil para reduzir faltas e cancelamentos de última hora." />
                      <FieldLabel htmlFor="reminder-hours">
                        Horas de antecedência para notificar:
                      </FieldLabel>
                    </FieldRow>

                    <NumberInput
                      id="reminder-hours"
                      type="number"
                      min={1}
                      max={48}
                      value={reminderHours}
                      onChange={(e) => setReminderHours(e.target.value)}
                    />

                    <div>
                      <SaveButton type="submit" disabled={saving}>
                        {saving ? "Salvando..." : "Salvar"}
                      </SaveButton>
                    </div>
                  </InnerForm>
                </NotificationCard>
              </div>
            </>
          )}
    </PageLayout>
  );
}
