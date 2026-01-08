import React, { useEffect } from "react";
import styled from "styled-components";
import "../styles/index.css";
import Topbar from "../components/topbar";
import { Container } from "../components/container/style";
import {
  getCompanyProperties,
  updateCompany,
  updateCompanyProperties
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
  width: 100%
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
      }
      if (companyLogoResponse.status !== 200) {
        toast.error("Erro ao atualizar a logo da empresa");
        return;
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
    <>
        <Topbar {...companyInfo} loggedIn />

        <Container 
            $width={!mobile ? "100%" : "90%"}
            $display="flex"
            $flexdirection="column"
            $padding={!mobile ? "0" : "1rem"}
            $margin="0"
            $backgroundcolor="transparent"
            $borderradius="0"
            $boxshadow="0"
        >
        <Sidebar>
          {!loading && companyProperties && (
            <Container
              $width="90%"
              $backgroundcolor="var(--color-background)"
              $borderradius="0 1rem 2rem 1rem"
              $padding="0"
              $display="flex"
              $flexdirection="column"
            >
              <Title
                $padding="1rem"
                $margin="0"
                $fontweight="600"
                $fontsize="1.25rem"
                $color="var(--color-dark)"
              >
                Configurações
              </Title>

              <Separator
                $width="calc(100% - 2rem)"
                $bordercolor="var(--color-dark)"
                $margin="0 1rem 1rem 1rem"
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
                    onChange={e =>
                      handleCompanyInfo("instagram", e.target.value)
                    }
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
            </Container>
          )}

          {loading &&
            <Container 
                $width="100%" 
                $height="90vh" 
                $margin="0" 
                $padding="0" 
                $backgroundcolor="none"
                $borderradius="0" 
                $border="none"
                $display="flex" 
                $justifycontent="center" 
                $alignitems="center"
            >
                <span className="loader"></span>
            </Container>
          }
          <ToastContainer position="top-right" autoClose={3000} />
        </Sidebar>
      </Container>
    </>
  );
}
