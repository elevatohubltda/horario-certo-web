import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import "../styles/index.css";
import { Message, PageLayout } from "../components/admin";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { isAvailableLogin, redirectToLogin } from "../util/auth";
import { isMobileApp } from "../services/api";
import { toast } from "react-toastify";
import {
  getPushNotificationSettings,
  updatePushNotificationSettings,
  updatePushPreferences,
  registerPushToken,
  unregisterPushToken,
} from "../services/endpoints/pushNotifications";

// Tipos de aviso que cada pessoa pode ligar/desligar (ownerOnly: só o dono recebe)
const PREFERENCES = [
  { key: "bookingCreated", title: "Novos agendamentos", hint: "Quando um cliente marca um horário." },
  { key: "bookingCancelled", title: "Cancelamentos", hint: "Quando um cliente desmarca." },
  { key: "bookingRescheduled", title: "Remarcações", hint: "Quando o cliente muda o horário pela área do cliente." },
  { key: "waitingList", title: "Lista de espera", hint: "Nova pessoa na lista e vaga liberada por um cancelamento." },
  { key: "dailySummary", title: "Resumo do dia", hint: "Às 7h, quantos agendamentos você tem e qual é o primeiro." },
  {
    key: "billingReminders",
    title: "Lembretes da assinatura",
    hint: "Fatura disponível, fatura vencendo hoje, último dia sem bloqueio e fim do acesso.",
    ownerOnly: true,
  },
];

const PreferenceRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1.2rem;

  & + & {
    border-top: 1px solid var(--ui-border);
  }
`;

const PreferenceText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.78rem;
  color: var(--ui-text-secondary);

  strong {
    font-size: 0.9rem;
    color: var(--ui-text);
    font-weight: 600;
  }
`;

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

/* ── Card ────────────────────────────────────────── */
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
  background: #fff;
  border-radius: var(--ui-radius) var(--ui-radius) 0 0;
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

const CardBody = styled.div`
  padding: 1.2rem;
  border-top: 1px solid var(--ui-border);
  background: #fff;
  border-radius: 0 0 var(--ui-radius) var(--ui-radius);
  font-size: 0.82rem;
  color: var(--ui-text-secondary);
  line-height: 1.6;
`;

const ExampleBlock = styled.div`
  background: #f9fafb;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-sm);
  padding: 0.8rem 1rem;
  margin: 0.6rem 0;
  font-size: 0.78rem;
  color: var(--ui-text);
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

/* ── Acesso restrito (fora do app) ───────────────── */
const InfoBlock = styled.div`
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

const PUSH_PERMISSION_CALLBACK = "__onPushPermissionResult";

export default function PushNotifications() {
  const companyUrl = Cookies.get("companyUrl");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [isOwner, setIsOwner] = useState(true);
  const [preferences, setPreferences] = useState({});
  const pendingTokenRef = useRef(null);

  const applySettings = (data) => {
    setEnabled(Boolean(data?.enabled));
    setIsOwner(data?.owner !== false);
    setPreferences(data?.preferences || {});
  };

  const handlePreference = async (key) => {
    const value = !(preferences[key] !== false);
    setPreferences((prev) => ({ ...prev, [key]: value }));
    try {
      const res = await updatePushPreferences(companyUrl, { [key]: value });
      applySettings(res.data);
    } catch {
      setPreferences((prev) => ({ ...prev, [key]: !value }));
      toast.error("Não foi possível salvar a preferência");
    }
  };

  const inApp = isMobileApp();

  useEffect(() => {
    if (!isAvailableLogin()) {
      redirectToLogin(navigate);
      return;
    }
    loadPage();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!inApp) return;

    window[PUSH_PERMISSION_CALLBACK] = async ({ granted, token }) => {
      if (!granted || !token) {
        toast.error(
          "Permissão de notificações negada. Você pode habilitá-la depois nas configurações do dispositivo."
        );
        setSaving(false);
        return;
      }

      pendingTokenRef.current = token;
      await persistEnabled(true, token);
    };

    return () => {
      delete window[PUSH_PERMISSION_CALLBACK];
    };
    // eslint-disable-next-line
  }, [inApp, companyUrl]);

  const loadPage = async () => {
    try {
      const res = await getPushNotificationSettings(companyUrl);
      if (res.status === 200) {
        applySettings(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const persistEnabled = async (value, token) => {
    setSaving(true);
    try {
      if (value && token) {
        await registerPushToken(companyUrl, token);
      }

      const res = await updatePushNotificationSettings(companyUrl, { enabled: value });
      if (res.status === 200) {
        applySettings(res.data);
        toast.success(
          value
            ? "Notificações push ativadas com sucesso!"
            : "Notificações push desativadas."
        );

        if (!value && pendingTokenRef.current) {
          unregisterPushToken(companyUrl, pendingTokenRef.current).catch(() => {});
          pendingTokenRef.current = null;
        }
      } else {
        toast.error("Erro ao salvar configurações");
      }
    } catch {
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = () => {
    if (saving) return;

    const next = !enabled;

    if (!next) {
      persistEnabled(false);
      return;
    }

    if (!window.ReactNativeWebView) {
      toast.error("Não foi possível acessar os recursos do aplicativo.");
      return;
    }

    setSaving(true);
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: "PUSH_REQUEST_PERMISSION" }));
  };

  return (
    <PageLayout title="Notificações push" subtitle="Avisos no seu celular sempre que algo acontecer na sua agenda.">
          {loading ? (
            <Message>Carregando...</Message>
          ) : !inApp ? (
            <InfoBlock>
              <span style={{ fontSize: "2rem" }}>📱</span>
              <strong>Disponível apenas no aplicativo</strong>
              <span>
                As notificações push só podem ser ativadas a partir do
                aplicativo do Horário Certo, instalado no seu celular.
              </span>
            </InfoBlock>
          ) : (
            <>
              <div>
                <Card $on={enabled}>
                  <CardHeader $on={enabled}>
                    <CardHeaderLeft>
                      <CardTitle>Notificações push</CardTitle>
                      <CardSubtitle $on={enabled}>{enabled ? "Ativado" : "Desativado"}</CardSubtitle>
                    </CardHeaderLeft>
                    <ToggleLabel>
                      <ToggleInput
                        type="checkbox"
                        checked={enabled}
                        onChange={handleToggle}
                        disabled={saving}
                        readOnly
                      />
                      <ToggleSlider $on={enabled} />
                    </ToggleLabel>
                  </CardHeader>

                  <CardBody>
                    <p style={{ margin: 0 }}>
                      Receba avisos diretamente no seu celular sempre que algo
                      importante acontecer na sua agenda. Ao ativar, o
                      aplicativo solicitará a permissão de notificações do seu
                      dispositivo.
                      {!isOwner && " Você recebe só os avisos dos seus próprios agendamentos."}
                    </p>

                    {!enabled && (
                      <ExampleBlock>
                        <strong>Agendamento realizado!</strong>
                        <br />
                        Maria agendou uma Consulta em Segunda-feira, 10/06/2026 às 14:00.
                      </ExampleBlock>
                    )}

                    <p style={{ margin: "0.6rem 0 0 0" }}>
                      Você pode desativar as notificações a qualquer momento
                      voltando nesta página.
                    </p>

                    {saving && (
                      <div style={{ marginTop: "0.8rem" }}>
                        <SaveButton type="button" disabled>
                          Salvando...
                        </SaveButton>
                      </div>
                    )}
                  </CardBody>
                </Card>

                {enabled && (
                  <Card>
                    <CardHeader>
                      <CardHeaderLeft>
                        <CardTitle>O que você quer receber</CardTitle>
                        <CardSubtitle>Desligue os avisos que não fazem sentido para você.</CardSubtitle>
                      </CardHeaderLeft>
                    </CardHeader>
                    <div style={{ borderTop: "1px solid var(--ui-border)" }}>
                      {PREFERENCES.filter((p) => isOwner || !p.ownerOnly).map((pref) => {
                        const on = preferences[pref.key] !== false;
                        return (
                          <PreferenceRow key={pref.key}>
                            <PreferenceText>
                              <strong>{pref.title}</strong>
                              {pref.hint}
                            </PreferenceText>
                            <ToggleLabel aria-label={pref.title}>
                              <ToggleInput type="checkbox" checked={on} onChange={() => handlePreference(pref.key)} />
                              <ToggleSlider $on={on} />
                            </ToggleLabel>
                          </PreferenceRow>
                        );
                      })}
                    </div>
                    {isOwner && (
                      <CardBody>
                        Avisos importantes da assinatura (pagamento confirmado, cobrança recusada no cartão e agenda
                        bloqueada) sempre chegam enquanto as notificações estiverem ativadas.
                      </CardBody>
                    )}
                  </Card>
                )}
              </div>
            </>
          )}
    </PageLayout>
  );
}
