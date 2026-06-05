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

const WHATSAPP_PLUS = "Whatsapp Plus(mensagens ilimitadas)";
const WHATSAPP_BASICO = "Whatsapp Básico(até 500 mensagens)";

const Form = styled.form`
  background: transparent;
  box-shadow: none;
  padding: 1rem;
  max-width: 480px;
`;

const Label = styled.label`
  font-size: 0.8rem;
  color: var(--color-earth);
  display: block;
  margin-bottom: 0.4rem;
`;

const Input = styled.input`
  padding: 0.5rem;
  border-top: 1px solid var(--color-sage);
  background-color: #fff;
  color: var(--color-dark);
  font-size: 0.85rem;
  width: 100%;
  margin-bottom: 1.5rem;

  &:focus {
    outline: none;
    border-color: var(--color-sage);
  }
`;

const SaveButton = styled.button`
  background-color: var(--color-sage);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.4rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.85;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const InfoText = styled.p`
  font-size: 0.8rem;
  color: var(--color-muted);
  margin-top: -1rem;
  margin-bottom: 1.5rem;
`;

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

export default function Notifications() {
  const companyUrl = Cookies.get("companyUrl");
  const companyInfo = JSON.parse(Cookies.get("companyInfo") || "{}");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [daysBefore, setDaysBefore] = useState(3);
  const [mobile, setMobile] = useState(false);

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
      const allowed = features.some(
        (f) => f.name === WHATSAPP_PLUS || f.name === WHATSAPP_BASICO
      );
      setHasAccess(allowed);

      if (allowed) {
        const settingsRes = await getNotificationSettings(companyUrl);
        if (settingsRes.status === 200) {
          setDaysBefore(settingsRes.data.daysBefore);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const days = parseInt(daysBefore, 10);
    if (isNaN(days) || days < 1 || days > 30) {
      toast.error("Informe um valor entre 1 e 30 dias");
      return;
    }
    setSaving(true);
    try {
      const res = await updateNotificationSettings(companyUrl, { daysBefore: days });
      if (res.status === 200) {
        toast.success("Configurações salvas com sucesso!");
      } else {
        toast.error("Erro ao salvar configurações");
      }
    } catch (error) {
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
              $width="100%"
              $height="100vh"
              $margin="0"
              $padding="0"
              $backgroundcolor="none"
              $borderRadius="0"
              $border="none"
              $display="flex"
              $justifycontent="center"
              $alignitems="center"
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
                plano <strong>Whatsapp Plus</strong>.
              </span>
              <SaveButton
                type="button"
                onClick={() => navigate("/assinatura")}
                style={{ marginTop: "0.5rem" }}
              >
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
                $margin="0 1rem 1rem 1rem"
                $style="dotted"
              />

              <Form onSubmit={handleSave}>
                <Label>Dias de antecedência para lembrar o cliente:</Label>
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={daysBefore}
                  onChange={(e) => setDaysBefore(e.target.value)}
                />
                <InfoText>
                  Clientes que já agendaram pelo menos 2 vezes e não possuem
                  agendamento futuro receberão uma mensagem via WhatsApp X dias
                  antes da data prevista do próximo serviço.
                </InfoText>

                <SaveButton type="submit" disabled={saving}>
                  {saving ? "Salvando..." : "Salvar"}
                </SaveButton>
              </Form>
            </>
          )}
        </Sidebar>
      </Container>
    </>
  );
}
