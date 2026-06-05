import React, { useEffect, useState } from "react";
import styled from "styled-components";
import "../styles/index.css";
import Topbar from "../components/topbar";
import { Container } from "../components/container/style";
import { Title } from "../components/title";
import { Separator } from "../components/separator/style";
import Sidebar from "../components/sidebar";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { isAvailableLogin } from "../util/auth";
import { isMobile } from "../util/util";
import { ToastContainer, toast } from "react-toastify";
import { getFeaturesByCompany } from "../services/endpoints/plans";
import { getNotificationSettings, updateNotificationSettings } from "../services/endpoints/notifications";

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
  border: 1px solid ${({ $on }) => ($on ? "var(--color-sage)" : "#e0e0e0")};
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.25s;
  max-width: 540px;
  margin-bottom: 1rem;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.2rem;
  cursor: pointer;
  background: ${({ $on }) => ($on ? "rgba(142,168,142,0.08)" : "#fafafa")};
  transition: background 0.25s;
  user-select: none;
`;

const CardHeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const CardTitle = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-dark);
`;

const CardSubtitle = styled.span`
  font-size: 0.75rem;
  color: ${({ $on }) => ($on ? "var(--color-sage)" : "var(--color-muted)")};
`;

const CollapsibleBody = styled.div`
  max-height: ${({ $open }) => ($open ? "400px" : "0")};
  overflow: hidden;
  transition: max-height 0.3s ease;
`;

const CardBody = styled.div`
  padding: 1.2rem;
  border-top: 1px solid #eee;
  background: #fff;
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
  color: var(--color-earth);
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
  bottom: calc(100% + 6px);
  left: 0;
  z-index: 200;
  transition: opacity 0.18s;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);

  &::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 8px;
    border: 5px solid transparent;
    border-top-color: #333;
  }
`;

const QuestionBtn = styled.button`
  background: var(--color-sage);
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
  width: 80px;
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--color-sage);
  border-radius: 6px;
  background: #fff;
  color: var(--color-dark);
  font-size: 0.85rem;
  margin-top: 0.2rem;
  margin-bottom: 1rem;

  &:focus {
    outline: none;
    border-color: var(--color-dark);
  }
`;

const SaveButton = styled.button`
  background-color: var(--color-sage);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.55rem 1.3rem;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover { opacity: 0.85; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

/* ── Acesso negado ───────────────────────────────── */
const AccessDenied = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  gap: 1rem;
  text-align: center;
  color: var(--color-muted);
  font-size: 0.9rem;
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
      <CardHeader $on={enabled} onClick={onToggle}>
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
  const companyInfo = JSON.parse(Cookies.get("companyInfo") || "{}");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [mobile, setMobile] = useState(false);

  const [retentionEnabled, setRetentionEnabled] = useState(false);
  const [retentionDays, setRetentionDays] = useState(3);

  useEffect(() => {
    setMobile(isMobile());
    if (!isAvailableLogin()) {
      navigate("/" + companyUrl);
      return;
    }
    loadPage();
    // eslint-disable-next-line
  }, []);

  const loadPage = async () => {
    try {
      const featuresRes = await getFeaturesByCompany(companyUrl);
      const features = featuresRes.data || [];
      const allowed = features.some(hasWhatsAppFeature);
      setHasAccess(allowed);

      if (allowed) {
        const res = await getNotificationSettings(companyUrl);
        if (res.status === 200) {
          setRetentionEnabled(res.data.enabled);
          setRetentionDays(res.data.daysBefore);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRetention = async (e) => {
    e.preventDefault();
    const days = parseInt(retentionDays, 10);
    if (isNaN(days) || days < 1 || days > 30) {
      toast.error("Informe um valor entre 1 e 30 dias");
      return;
    }
    setSaving(true);
    try {
      const res = await updateNotificationSettings(companyUrl, {
        enabled: retentionEnabled,
        daysBefore: days,
      });
      if (res.status === 200) {
        toast.success("Configurações salvas com sucesso!");
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
    <>
      <Topbar {...companyInfo} loggedIn />
      <ToastContainer />

      <Container
        $width="100%"
        $display="flex"
        $flexdirection="column"
        $padding={!mobile ? "0" : "1rem"}
        $margin="0"
        $backgroundcolor="transparent"
        $borderRadius="0"
        $boxshadow="0"
      >
        <Sidebar>
          {loading ? (
            <Container
              $width="100%" $height="100vh" $margin="0" $padding="0"
              $backgroundcolor="none" $borderRadius="0" $border="none"
              $display="flex" $justifycontent="center" $alignitems="center"
              $boxshadow="none"
            >
              <span className="loader" />
            </Container>
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
              <Title
                $padding="1rem"
                $margin="1rem 0 0 0"
                $fontweight="600"
                $fontsize="2rem"
                $color="var(--color-dark)"
                $width="max-content"
              >
                Notificações
              </Title>

              <Separator
                $width="calc(100% - 2rem)"
                $bordercolor="var(--color-olive)"
                $margin="0 1rem 1.5rem 1rem"
                $style="dotted"
              />

              <div style={{ padding: "0 1rem" }}>
                <NotificationCard
                  title="Notificação de retorno"
                  subtitle={retentionEnabled ? "Ativado" : "Desativado"}
                  enabled={retentionEnabled}
                  onToggle={() => setRetentionEnabled((v) => !v)}
                >
                  <form onSubmit={handleSaveRetention}>
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
                  </form>
                </NotificationCard>
              </div>
            </>
          )}
        </Sidebar>
      </Container>
    </>
  );
}
