import React, { useEffect } from "react";
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

export default function ChangePassword() {
  const companyUrl = Cookies.get("companyUrl");
  const companyInfo = JSON.parse(Cookies.get("companyInfo"));
  const [loading, setLoading] = React.useState(true);
  const [mobile, setMobile] = React.useState();
  const navigate = useNavigate();
  const [password, setPassword] = React.useState({ stepOne: "", stepTwo: "" });

  const update = async () => {
    if (password.stepOne === "" || password.stepTwo === "" || (password.stepOne !== password.stepTwo)) {
      toast.error("Preencha todos os campos corretamente!");
      return
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
  }

  const handlePassword = (parameter, value) => {
    setPassword((prev) => ({
      ...prev,
      [parameter]: value
    }));
  }

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
      <Topbar
        name={companyInfo.name}
        imagem={companyInfo.imagem}
        whatsapp={companyInfo.whatsapp}
        instagram={companyInfo.instagram}
        loggedIn={true}
      />
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
          <Container
            $width="90%"
            $padding="0"
            $flexdirection={mobile ? "column" : "row"}
            $backgroundcolor="#fff"
            $borderradius="1rem"
          >
            <>
              <Title
                $padding="1rem"
                $fontweight="600"
                $fontsize="1.25rem"
                $color="#6A5ACD"
                $texttransform="uppercase"
              >
                Alterar Senha
              </Title>
              <Separator $width="calc(100% - 2rem)" $bordercolor="#ccc" $margin="0 1rem 2rem 1rem" />
              <Container
                $width="auto"
                $display="flex"
                $flexdirection="column"
                $padding="1rem"
                $margin="0"
                $backgroundcolor="transparent"
                $borderradius="0"
                $boxshadow="0"
              >
                <form style={{ backgroundColor: "transparent", boxShadow: "none", width: "100%", padding: "0" }}>
                  <label style={{ fontSize: "0.8rem" }}>Nova senha:</label>
                  <input
                    type="text"
                    placeholder='Digite a nova senha'
                    value={password.stepOne}
                    onChange={(e) => handlePassword('stepOne', e.target.value)}
                    style={{ border: "1px solid #f3f3f3", marginTop: "1rem" }}
                  />
                  <label style={{ fontSize: "0.8rem" }}>Nova senha novamente:</label>
                  <input
                    type="text"
                    placeholder='Digite a nova senha novamente'
                    value={password.stepTwo}
                    onChange={(e) => handlePassword('stepTwo', e.target.value)}
                    style={{ border: "1px solid #f3f3f3", marginTop: "1rem" }}
                  />
                  <Separator $width="100%" $bordercolor="#ccc" />
                  <Container
                    $width="auto"
                    $display="flex"
                    $alignitems="flex-end"
                    $justifycontent="flex-end"
                    $margin="0"
                    $backgroundcolor="transparent"
                  >
                    <Button
                      style={{ fontSize: "0.8rem", padding: "0.5rem 1rem", backgroundColor: "#00b900", borderColor: "#00b900" }}
                      onClick={update}>
                      Salvar alterações
                    </Button>
                  </Container>
                </form>
              </Container>
            </>
          </Container>
          <ToastContainer position="top-right" autoClose={3000} closeButton={false} />
        </Sidebar>
      </Container>
    </>
  );
}