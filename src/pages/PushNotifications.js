import React, { useEffect, useRef, useState } from "react";
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
import { isMobileApp } from "../services/api";
import { toast } from "react-toastify";
import {
  getPushNotificationSettings,
  updatePushNotificationSettings,
  registerPushToken,
  unregisterPushToken,
} from "../services/endpoints/pushNotifications";

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
  border: 1px solid ${({ $on }) => ($on ? "var(--color-sage)" : "#e0e0e0")};
  border-radius: 12px;
  margin-bottom: 1rem;
  transition: border-color 0.25s;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.2rem;
  background: ${({ $on }) => ($on ? "rgba(142,168,142,0.08)" : "#fafafa")};
  border-radius: 12px;
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

const CardBody = styled.div`
  padding: 1.2rem;
  border-top: 1px solid #eee;
  background: #fff;
  border-radius: 0 0 12px 12px;
  font-size: 0.82rem;
  color: var(--color-earth);
  line-height: 1.6;
`;

const ExampleBlock = styled.div`
  background: #f5f5f7;
  border-radius: 8px;
  padding: 0.8rem 1rem;
  margin: 0.6rem 0;
  font-size: 0.78rem;
  color: var(--color-dark);
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

/* ── Acesso restrito (fora do app) ───────────────── */
const InfoBlock = styled.div`
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

const PUSH_PERMISSION_CALLBACK = "__onPushPermissionResult";

export default function PushNotifications() {
  const companyUrl = Cookies.get("companyUrl");
  const companyInfo = JSON.parse(Cookies.get("companyInfo") || "{}");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const pendingTokenRef = useRef(null);

  const inApp = isMobileApp();

  useEffect(() => {
    setMobile(isMobile());
    if (!isAvailableLogin()) {
      navigate("/" + companyUrl);
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
        setEnabled(res.data.enabled);
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
        setEnabled(res.data.enabled);
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
    <>
      <Topbar {...companyInfo} loggedIn />

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
              <Title
                $padding="1rem"
                $margin="1rem 0 0 0"
                $fontweight="600"
                $fontsize="2rem"
                $color="var(--color-dark)"
                $width="max-content"
              >
                Notificações Push
              </Title>

              <Separator
                $width="calc(100% - 2rem)"
                $bordercolor="var(--color-olive)"
                $margin="0 1rem 1.5rem 1rem"
                $style="dotted"
              />

              <div style={{ padding: "0 1rem" }}>
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
                    </p>

                    <ExampleBlock>
                      <strong>Agendamento realizado!</strong>
                      <br />
                      Maria agendou um Corte de cabelo em Segunda-feira, 10/06/2026 às 14:00.
                    </ExampleBlock>

                    <ExampleBlock>
                      <strong>Agendamento cancelado!</strong>
                      <br />
                      Maria cancelou o Corte de cabelo de Segunda-feira, 10/06/2026 às 14:00.
                    </ExampleBlock>

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
              </div>
            </>
          )}
        </Sidebar>
      </Container>
    </>
  );
}
