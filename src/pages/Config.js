import React, { useEffect } from "react";
import styled from "styled-components";
import "../styles/index.css";
import Topbar from "../components/topbar";
import { Container } from "../components/container/style";
import {
  getCompanyProperties,
  updateCompany,
  updateCompanyProperties,
  connectWhatsApp,
  getWhatsAppQrCode,
  getWhatsAppStatus,
  disconnectWhatsApp
} from "../services/endpoints/company";
import Cookies from "js-cookie";
import Sidebar from "../components/sidebar";
import { isAvailableLogin } from "../util/auth";
import { useNavigate } from "react-router-dom";
import { isMobile } from "../util/util";
import { Title } from "../components/title";
import { Separator } from "../components/separator/style";
import { ToastContainer, toast } from "react-toastify";
import { Button } from "react-bootstrap";
import {
  formataNumeroTelefone,
  paraHoraCompleta,
  paraHoraSemSegundos
} from "../util/format";
import { validarHoraCompleta } from "../util/validate";
import { uploadLogo } from "../services/endpoints/upload";
import { XIcon } from "lucide-react";
import { expiresAt } from "../util/date";

/* =======================
   Styled Components
======================= */

const Form = styled.form`
  width: calc(100%-2rem);
  background: transparent;
  box-shadow: none;
  padding: 1rem;
`;

const Label = styled.label`
  font-size: 0.8rem;
  color: var(--color-earth);
`;

const Input = styled.input`
  margin-top: 1rem;
  padding: 0.5rem;
  border-top: 1px solid var(--color-sage);
  background-color: #fff;
  color: var(--color-dark);
  font-size: 0.85rem;

  &:focus {
    outline: none;
    border-color: var(--color-sage);
  }

`;

const UploadWrapper = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  align-items: center;
  flex-direction: ${({ $mobile }) => ($mobile ? "column" : "row")};
  width: 100%;
`;

const LogoPreview = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  box-shadow: rgba(0, 0, 0, 0.15) 2px 2px 5px 0px;
`;

const RemoveLogo = styled(XIcon)`
  margin-top: 18px;
  margin-left: 8px;
  border: 1px solid #ff8555;
  border-radius: 12px;
  color: #ff8555;
  cursor: pointer;

    &:hover {
        background-color: #ff8555;
        color: #fff;
    }
`;

const UploadInfo = styled.span`
  font-size: 10px;
  color: var(--color-muted);
`;

const Actions = styled(Container)`
  justify-content: flex-end;
  align-items: flex-end;
  background: transparent;
  margin: 0;
  width: 100%;
  box-shadow: none;
`;

/* =======================
   Component
======================= */

export default function Config() {
  const companyUrl = Cookies.get("companyUrl");
  const [companyInfo, setCompanyInfo] = React.useState(
    JSON.parse(Cookies.get("companyInfo"))
  );
  const [companyProperties, setCompanyProperties] = React.useState();
  const [loading, setLoading] = React.useState(true);
  const [mobile, setMobile] = React.useState();
  const navigate = useNavigate();
  const [companyLogo, setCompanyLogo] = React.useState("");

  const [whatsAppStatus, setWhatsAppStatus] = React.useState(null);
  const [whatsAppQrCode, setWhatsAppQrCode] = React.useState(null);
  const [whatsAppLoading, setWhatsAppLoading] = React.useState(false);

  const getCompanyProps = async () => {
    try {
      const response = await getCompanyProperties(companyUrl);
      if (response.status === 200) {
        setCompanyProperties(response.data);
        Cookies.set("companyProperties", JSON.stringify(response.data), {
          expires: expiresAt
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateCompanyProps = async () => {
    if (!validarHoraCompleta(companyProperties.cancelTime) && companyLogo === "") {
      toast.error("O tempo para cancelamento deve estar no formato HH:mm");
      return;
    }
    if(companyLogo !== "" && companyLogo.size > 2 * 1024 * 1024) {
      toast.error("O tamanho da logo não pode exceder 2MB");
      return;
    }
    try {
      const responseCompanyProperties = await updateCompanyProperties(
        companyUrl,
        companyProperties
      );
      if (responseCompanyProperties.status === 200) {
        Cookies.set("companyProperties", JSON.stringify(companyProperties), {
          expires: expiresAt
        });
      } else {
        toast.error("Erro ao atualizar as propriedades da empresa");
        return;
      }
      if (companyLogo !== "") {
        const companyLogoResponse = await uploadLogo(companyUrl, companyLogo);
        if (companyLogoResponse.status !== 200) {
        toast.error("Erro ao atualizar a logo da empresa");
        return;
      }
      }
      const responseCompany = await updateCompany(
        companyInfo,
        companyUrl
      );
      if (responseCompany.status === 200) {
        Cookies.set("companyInfo", JSON.stringify(companyInfo), {
          expires: expiresAt
        });
      } else {
        toast.error("Erro ao atualizar as informações da empresa");
        return;
      }
      toast.success("Configurações atualizadas com sucesso!");
    } catch (error) {
      toast.error(error);
    }

    try {
      const response = await updateCompany(companyInfo, companyUrl);
      if (response.status === 200) {
        Cookies.set("companyInfo", JSON.stringify(companyInfo), {
          expires: expiresAt
        });
      }
    } catch (error) {
      toast.error(error);
    }
  };

  const handleCompanyProperties = (parameter, value) => {
    setCompanyProperties(prev => ({
      ...prev,
      [parameter]: value
    }));
  };

  const handleCompanyInfo = (parameter, value) => {
    setCompanyInfo(prev => ({
      ...prev,
      [parameter]: value
    }));
  };

  const fetchWhatsAppStatus = React.useCallback(async () => {
    try {
      const res = await getWhatsAppStatus(companyUrl);
      setWhatsAppStatus(res.data);
    } catch {
      setWhatsAppStatus({ connected: false });
    }
  }, [companyUrl]);

  const handleConnectWhatsApp = async () => {
    setWhatsAppLoading(true);
    setWhatsAppQrCode(null);
    try {
      await connectWhatsApp(companyUrl);

      // Aguarda 6s para a instância inicializar antes de começar a buscar o QR
      await new Promise(r => setTimeout(r, 6000));

      // Polling até o QR code estar disponível (máx 15 tentativas, 3s entre cada = 45s total)
      let qrBase64 = null;
      for (let i = 0; i < 15; i++) {
        try {
          const qrRes = await getWhatsAppQrCode(companyUrl);
          const data = qrRes.data;
          const base64 = data?.base64 || data?.qrcode?.base64 || data?.code;
          if (base64) { qrBase64 = base64; break; }
        } catch {}
        await new Promise(r => setTimeout(r, 3000));
      }

      if (qrBase64) {
        setWhatsAppQrCode(qrBase64);
      } else {
        toast.error("QR code não gerado. Tente novamente.");
      }
    } catch {
      toast.error("Erro ao conectar. Tente novamente.");
    } finally {
      setWhatsAppLoading(false);
    }
  };

  const handleDisconnectWhatsApp = async () => {
    setWhatsAppLoading(true);
    try {
      await disconnectWhatsApp(companyUrl);
      setWhatsAppStatus({ connected: false });
      setWhatsAppQrCode(null);
      toast.success("WhatsApp desconectado.");
    } catch {
      toast.error("Erro ao desconectar.");
    } finally {
      setWhatsAppLoading(false);
    }
  };

  useEffect(() => {
    if (isAvailableLogin()) {
      getCompanyProps();
      setMobile(isMobile());
      fetchWhatsAppStatus();
    } else {
      navigate("/" + companyUrl);
    }
    // eslint-disable-next-line
  }, [companyUrl]);

  useEffect(() => {
    if (!whatsAppQrCode) return;
    const interval = setInterval(async () => {
      try {
        const res = await getWhatsAppStatus(companyUrl);
        setWhatsAppStatus(res.data);
        if (res.data?.connected) {
          setWhatsAppQrCode(null);
          toast.success("WhatsApp conectado com sucesso!");
          clearInterval(interval);
        }
      } catch {}
    }, 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [whatsAppQrCode]);

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
          {!loading && companyProperties && (
            <>
              {loading && companyInfo === undefined &&
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
                  <span className="loader"></span>
                </Container>
              }
              <Title
                $padding="1rem"
                $margin="1rem 0 0 0"
                $fontweight="600"
                $fontsize="2rem"
                $color="var(--color-dark)"
                $width="max-content"
              >
                Configurações
              </Title>

              <Separator
                $width="calc(100% - 2rem)"
                $bordercolor="var(--color-olive)"
                $margin="0 1rem 1rem 1rem"
                $style="dotted"
              />
              <Form>
                  <Label>Tempo para cancelamento:</Label>
                  <Input
                    value={paraHoraSemSegundos(companyProperties.cancelTime)}
                    onChange={e =>
                      handleCompanyProperties(
                        "cancelTime",
                        paraHoraCompleta(e.target.value)
                      )
                    }
                  />

                  <Label>Nome da empresa:</Label>
                  <Input
                    value={companyInfo.name}
                    onChange={e =>
                      handleCompanyInfo("name", e.target.value)
                    }
                  />

                  <Label>Whatsapp:</Label>
                  <Input
                    value={formataNumeroTelefone(companyInfo.whatsapp)}
                    onChange={e =>
                      handleCompanyInfo(
                        "whatsapp",
                        formataNumeroTelefone(e.target.value)
                      )
                    }
                  />

                  <Label>Instagram:</Label>
                  <Input
                      value={companyInfo.instagram}
                      onChange={(e) => {
                          let value = e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9._]/g, '')
                          .replace(/\.{2,}/g, '.');

                          if (value.startsWith('.')) value = value.slice(1);
                          if (value.length > 30) value = value.slice(0, 30);

                          handleCompanyInfo("instagram", value);
                      }}
                      onKeyDown={(e) => {
                          if (
                          e.key.length === 1 &&
                          !/[a-z0-9._]/i.test(e.key)
                          ) {
                          e.preventDefault();
                          }
                      }}
                  />

                  <Label>Logo da empresa:</Label>
                  <UploadWrapper $mobile={mobile}>
                    <div>
                        <LogoPreview
                            src={
                                (companyLogo && companyLogo !== "") 
                                ? URL.createObjectURL(companyLogo)
                                : companyInfo.imagem
                            }
                        />
                        {companyLogo && (
                        <RemoveLogo onClick={() => setCompanyLogo("")} />
                        )}
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                      <input
                        type="file"
                        style={{
                          background: 'none',
                          border: 'none',
                          boxShadow: 'none',
                          padding: '0',
                          margin: '0',
                          height: 'max-content',
                          fontSize: '0.8rem'
                        }}
                        value={companyLogo ? undefined : ""}
                        onChange={e => setCompanyLogo(e.target.files[0])}
                      />
                      <UploadInfo>
                        Máx 2MB • PNG, JPG, JPEG
                      </UploadInfo>
                    </div>
                  </UploadWrapper>

                  <Separator
                    $width="100%"
                    $bordercolor="var(--color-dark)"
                    $margin="1rem 0 1rem 0"
                    $style="dotted"
                  />

                  <Actions>
                    <Button
                      type="button"
                      style={{
                        backgroundColor: "var(--color-sage)",
                        borderColor: "var(--color-sage)"
                      }}
                      onClick={updateCompanyProps}
                    >
                      Salvar alterações
                    </Button>
                  </Actions>
              </Form>

              <Separator
                $width="calc(100% - 2rem)"
                $bordercolor="var(--color-olive)"
                $margin="0.5rem 1rem 1rem 1rem"
                $style="dotted"
              />

              <div style={{ padding: "0 1rem 1.5rem" }}>
                <Title
                  $fontweight="600"
                  $fontsize="1.1rem"
                  $color="var(--color-dark)"
                  $margin="0 0 0.5rem 0"
                >
                  Notificações via WhatsApp
                </Title>
                <p style={{ fontSize: "0.82rem", color: "#666", margin: "0 0 1rem 0" }}>
                  Conecte o WhatsApp da sua barbearia para enviar confirmações, remarcações e cancelamentos automaticamente para seus clientes.
                </p>

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "1rem"
                }}>
                  <span style={{
                    display: "inline-block",
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: whatsAppStatus?.connected ? "#16a34a" : "#d1d5db"
                  }} />
                  <span style={{ fontSize: "0.85rem", color: "var(--color-dark)" }}>
                    {whatsAppStatus?.connected ? "Conectado" : "Desconectado"}
                  </span>
                </div>

                {whatsAppQrCode && (
                  <div style={{ marginBottom: "1rem" }}>
                    <p style={{ fontSize: "0.8rem", color: "#555", marginBottom: "0.5rem" }}>
                      Abra o WhatsApp no celular → Dispositivos conectados → Conectar dispositivo → Escaneie o QR code abaixo:
                    </p>
                    <img
                      src={`data:image/png;base64,${whatsAppQrCode.replace(/^data:image\/[a-z]+;base64,/, '')}`}
                      alt="QR Code WhatsApp"
                      style={{ width: 200, height: 200, border: "1px solid #e5e7eb", borderRadius: 8 }}
                    />
                  </div>
                )}

                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  {!whatsAppStatus?.connected && (
                    <Button
                      type="button"
                      disabled={whatsAppLoading}
                      style={{ backgroundColor: "#25D366", borderColor: "#25D366", fontSize: "0.85rem" }}
                      onClick={handleConnectWhatsApp}
                    >
                      {whatsAppLoading ? "Aguarde..." : whatsAppQrCode ? "Atualizar QR Code" : "Conectar WhatsApp"}
                    </Button>
                  )}
                  {whatsAppStatus?.connected && (
                    <Button
                      type="button"
                      variant="outline-danger"
                      disabled={whatsAppLoading}
                      style={{ fontSize: "0.85rem" }}
                      onClick={handleDisconnectWhatsApp}
                    >
                      {whatsAppLoading ? "Aguarde..." : "Desconectar"}
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
          <ToastContainer 
            position={mobile ? "bottom-center" : "top-right"} 
            autoClose={3000} 
            style={mobile ? { margin: '0 5% 1rem 5%', width: '90%' } : undefined}
          />
        </Sidebar>
      </Container>
    </>
  );
}
