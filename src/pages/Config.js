import React, { useEffect } from "react";
import styled from "styled-components";
import "../styles/index.css";
import {
  getCompanyProperties,
  updateCompany,
  updateCompanyProperties
} from "../services/endpoints/company";
import Cookies from "js-cookie";
import { isAvailableLogin, setSecureCookie, redirectToLogin } from "../util/auth";
import { useNavigate } from "react-router-dom";
import { isMobile } from "../util/util";
import { ToastContainer, toast } from "react-toastify";
import { Button as UiButton, Field, FieldHint, FormActions, FormGrid, FormSection, Input, Message, PageLayout, Select } from "../components/admin";
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

// Formulário num card de largura total, no padrão do sistema
const Form = styled.form`
  && {
    width: 100%;
    box-sizing: border-box;
    background: #fff;
    border-radius: var(--ui-radius);
    box-shadow: var(--ui-card-shadow);
    padding: 1.5rem;
  }
`;

const LogoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const LogoPreview = styled.div`
  position: relative;
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #f3f4f6 center / cover no-repeat;
  background-image: ${({ $src }) => ($src ? `url("${$src}")` : "none")};
  border: 1px solid var(--ui-border);
`;

const RemoveLogo = styled.button`
  position: absolute;
  top: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: 50%;
  border: 1px solid var(--ui-border);
  background: #fff;
  color: var(--ui-danger);
  cursor: pointer;
`;

// O input de arquivo fica escondido; o rótulo faz o papel de botão
const UploadButton = styled.label`
  display: inline-flex;
  align-items: center;
  width: fit-content;
  height: 36px;
  padding: 0 1rem;
  border-radius: 999px;
  border: 1px solid var(--ui-input-border);
  background: #fff;
  color: var(--ui-text);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #f3f4f6;
  }

  input {
    display: none;
  }
`;

const UploadInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
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
      redirectToLogin(navigate);
    }
    // eslint-disable-next-line
  }, [companyUrl]);

  return (
    <PageLayout title="Configurações" subtitle="Dados da empresa, regras de cancelamento e modo de agenda.">
          {(loading || !companyProperties) && <Message>Carregando...</Message>}
          {!loading && companyProperties && (
            <>
              <Form>
                  <FormSection>Agenda</FormSection>
                  <FormGrid>
                    <Field>
                      Tempo mínimo para cancelamento
                      <Input
                        placeholder="02:00"
                        value={paraHoraSemSegundos(companyProperties.cancelTime)}
                        onChange={e =>
                          handleCompanyProperties(
                            "cancelTime",
                            paraHoraCompleta(e.target.value)
                          )
                        }
                      />
                      <FieldHint>Antecedência mínima (hh:mm) para o cliente desmarcar.</FieldHint>
                    </Field>

                    <Field>
                      Modo de agenda
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
                        <FieldHint>
                          Configure os horários de abertura e fechamento em{" "}
                          <a href="/configurar-horario-semanal" style={{ color: "var(--ui-text)", fontWeight: 600 }}>Configuração de horários</a>.
                        </FieldHint>
                      )}
                    </Field>
                  </FormGrid>

                  <FormSection>Dados da empresa</FormSection>
                  <FormGrid>
                    <Field>
                      Nome da empresa
                      <Input
                        value={companyInfo.name}
                        onChange={e =>
                          handleCompanyInfo("name", e.target.value)
                        }
                      />
                    </Field>

                    <Field>
                      WhatsApp
                      <Input
                        value={formataNumeroTelefone(companyInfo.whatsapp)}
                        onChange={e =>
                          handleCompanyInfo(
                            "whatsapp",
                            formataNumeroTelefone(e.target.value)
                          )
                        }
                      />
                    </Field>

                    <Field>
                      Instagram
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
                    </Field>

                    <Field as="div">
                      Logo da empresa
                      <LogoRow>
                        <LogoPreview
                          $src={
                            (companyLogo && companyLogo !== "")
                              ? URL.createObjectURL(companyLogo)
                              : companyInfo.imagem
                          }
                        >
                          {companyLogo && (
                            <RemoveLogo type="button" title="Remover arquivo" onClick={() => setCompanyLogo("")}>
                              <XIcon size={12} />
                            </RemoveLogo>
                          )}
                        </LogoPreview>
                        <UploadInfo>
                          <UploadButton>
                            {companyLogo ? "Trocar arquivo" : "Escolher arquivo"}
                            <input
                              type="file"
                              accept="image/png,image/jpeg"
                              value={companyLogo ? undefined : ""}
                              onChange={e => setCompanyLogo(e.target.files[0])}
                            />
                          </UploadButton>
                          <FieldHint>{companyLogo ? companyLogo.name : "Máx 2MB • PNG, JPG, JPEG"}</FieldHint>
                        </UploadInfo>
                      </LogoRow>
                    </Field>
                  </FormGrid>

                  <FormActions>
                    <UiButton type="button" onClick={updateCompanyProps}>
                      Salvar alterações
                    </UiButton>
                  </FormActions>
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
