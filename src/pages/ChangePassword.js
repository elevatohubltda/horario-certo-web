import React, { useEffect } from "react";
import styled from "styled-components";
import "../styles/index.css";
import Topbar from "../components/topbar";
import { Container } from "../components/container/style";
import Cookies from "js-cookie";
import Sidebar from "../components/sidebar";
import { isAvailableLogin } from "../util/auth";
import { useNavigate } from "react-router-dom";
import { isMobile } from "../util/util";
import { Title } from "../components/title";
import { Separator } from "../components/separator/style";
import { ToastContainer, toast } from "react-toastify";
import { Button } from "react-bootstrap";
import { updatePassword } from "../services/endpoints/user";

/* =======================
   Styled Components
======================= */

const Form = styled.form`
  width: calc(100% - 2rem);
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
  padding: 0.6rem;
  border-top: 1px solid var(--color-sage);
  background-color: #fff;
  color: var(--color-dark);
  font-size: 0.85rem;

  &:focus {
    outline: none;
    border-color: var(--color-dark);
  }
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

export default function ChangePassword() {
  const companyUrl = Cookies.get("companyUrl");
  const companyInfo = JSON.parse(Cookies.get("companyInfo"));
  const [loading, setLoading] = React.useState(true);
  const [mobile, setMobile] = React.useState();
  const navigate = useNavigate();
  const [password, setPassword] = React.useState({
    stepOne: "",
    stepTwo: ""
  });

  const update = async () => {
    if (
      password.stepOne === "" ||
      password.stepTwo === "" ||
      password.stepOne !== password.stepTwo
    ) {
      toast.error("Preencha todos os campos corretamente!");
      return;
    }

    try {
      const response = await updatePassword({ password: password.stepOne });
      if (response.status === 200) {
        toast.success("Senha alterada com sucesso!");
      } else {
        toast.error(response.data);
      }
    } catch (error) {
      toast.error(error);
    }
  };

  const handlePassword = (parameter, value) => {
    setPassword(prev => ({
      ...prev,
      [parameter]: value
    }));
  };

  useEffect(() => {
    if (isAvailableLogin()) {
      setMobile(isMobile());
      setLoading(false);
    } else {
      navigate("/" + companyUrl);
    }
  }, [companyUrl, navigate]);

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
          {loading &&
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
          {!loading && (
            <>
              <Title
                $padding="1rem"
                $margin="1rem 0 0 0"
                $fontweight="600"
                $fontsize="2rem"
                $color="var(--color-dark)"
                $width="max-content"
              >
                Alterar Senha
              </Title>

              <Separator
                $width="calc(100% - 2rem)"
                $bordercolor="var(--color-olive)"
                $margin="0 1rem 1rem 1rem"
                $style="dotted"
              />

              <Form>
                <Label>Nova senha:</Label>
                <Input
                  type="password"
                  placeholder="Digite a nova senha"
                  value={password.stepOne}
                  onChange={e =>
                    handlePassword("stepOne", e.target.value)
                  }
                />

                <Label>Confirme a nova senha:</Label>
                <Input
                  type="password"
                  placeholder="Digite a nova senha novamente"
                  value={password.stepTwo}
                  onChange={e =>
                    handlePassword("stepTwo", e.target.value)
                  }
                />

                <Separator
                  $width="100%"
                  $bordercolor="var(--color-dark)"
                  $margin="1rem 0 1rem 0"
                  $style="dotted"
                />

                <Actions>
                  <Button
                    style={{
                      backgroundColor: "var(--color-sage)",
                      borderColor: "var(--color-sage)",
                      fontSize: "0.8rem",
                      padding: "0.5rem 1rem"
                    }}
                    onClick={update}
                  >
                    Salvar alterações
                  </Button>
                </Actions>
              </Form>
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
