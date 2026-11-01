import React, { useEffect } from "react";
import styled from "styled-components";
import "../styles/index.css";
import {
  getCompanyProperties,
  updateCompany,
  updateCompanyProperties
} from "../services/endpoints/company";
import Cookies from "js-cookie";
import { isAvailableLogin, setSecureCookie } from "../util/auth";
import { useNavigate } from "react-router-dom";
import { isMobile } from "../util/util";
import { ToastContainer, toast } from "react-toastify";
import { Button as UiButton, Message, PageLayout } from "../components/admin";
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

// Formulário num card no padrão do sistema
const Form = styled.form`
  max-width: 640px;
  background: #fff;
  border-radius: var(--ui-radius);
  box-shadow: var(--ui-card-shadow);
  padding: 1.25rem;
`;

const Label = styled.label`
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--ui-text-secondary);
`;

const Input = styled.input`
  margin-top: 0.3rem;
  padding: 0.5rem 0.6rem;
  border: 1px solid var(--ui-input-border);
  border-radius: var(--ui-radius-sm);
  background-color: #fff;
  color: var(--ui-text);
  font-size: 0.85rem;

  &:focus {
    outline: none;
    border-color: var(--ui-primary);
  }
`;

const Select = styled.select`
  min-height: 40px;
  margin: 0.3rem 0 1rem;
  padding: 0.5rem 0.6rem;
  border: 1px solid var(--ui-input-border);
  border-radius: var(--ui-radius-sm);
  background-color: #fff;
  color: var(--ui-text);
  font-size: 0.85rem;
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

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid var(--ui-border);
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

  const getCompanyProps = async () => {
    try {
      const response = await getCompanyProperties(companyUrl);
      if (response.status === 200) {
        setCompanyProperties(response.data);
        setSecureCookie("companyProperties", JSON.stringify(response.data), {
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
        setSecureCookie("companyProperties", JSON.stringify(companyProperties), {
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
        setSecureCookie("companyInfo", JSON.stringify(companyInfo), {
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
        setSecureCookie("companyInfo", JSON.stringify(companyInfo), {
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

  useEffect(() => {
    if (isAvailableLogin()) {
      getCompanyProps();
      setMobile(isMobile());
    } else {
      navigate("/" + companyUrl);
    }
    // eslint-disable-next-line
  }, [companyUrl]);

  return (
    <PageLayout title="Configurações" subtitle="Dados da empresa, regras de cancelamento e modo de agenda.">
          {(loading || !companyProperties) && <Message>Carregando...</Message>}
          {!loading && companyProperties && (
            <>
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

                  <Label>Modo de agenda:</Label>
                  <Select
                    value={companyProperties.scheduleMode || "PADRAO"}
                    onChange={e =>
                      handleCompanyProperties("scheduleMode", e.target.value)
                    }
                  >
                    <option value="PADRAO">Padrão (horários fixos)</option>
                    <option value="SIMPLES">Simples (abertura, fechamento e intervalos)</option>
                  </Select>
                  {companyProperties.scheduleMode === "SIMPLES" && (
                    <span style={{ fontSize: "0.75rem", color: "var(--color-muted)", marginBottom: "1rem", display: "block" }}>
                      Configure os horários de abertura e fechamento em{" "}
                      <a href="/configurar-horario-semanal">Horário semanal</a>.
                    </span>
                  )}

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

                  <Actions>
                    <UiButton type="button" onClick={updateCompanyProps}>
                      Salvar alterações
                    </UiButton>
                  </Actions>
              </Form>

            </>
          )}
          <ToastContainer
            position={mobile ? "bottom-center" : "top-right"}
            autoClose={3000}
            style={mobile ? { margin: '0 5% 1rem 5%', width: '90%' } : undefined}
          />
    </PageLayout>
  );
}
