import React, { useEffect } from "react";
import "../styles/index.css";
import Topbar from "../components/topbar";
import { Container } from "../components/container/style";
import { getCompanyProperties, updateCompany, updateCompanyProperties } from "../services/endpoints/company";
import Cookies from "js-cookie";
import Sidebar from "../components/sidebar";
import { isAvailableLogin } from "../util/auth";
import { useNavigate } from "react-router-dom";
import { isMobile } from "../util/util";
import { Title } from "../components/title";
import { Separator } from "../components/separator/style";
import { ToastContainer, toast } from "react-toastify";
import { Button } from "react-bootstrap";
import { paraHoraCompleta, paraHoraSemSegundos } from "../util/format";
import { validarHoraCompleta } from "../util/validate";
import { uploadLogo } from "../services/endpoints/upload";

export default function Config() {
    const companyUrl = Cookies.get("companyUrl");
    const companyInfo = JSON.parse(Cookies.get("companyInfo"));
    const [companyProperties, setCompanyProperties] = React.useState(Cookies.get("companyProperties") ? JSON.parse(Cookies.get("companyProperties")) : undefined);
    const [loading, setLoading] = React.useState(true);
    const [mobile, setMobile] = React.useState();
    const navigate = useNavigate();
    const [companyLogo, setCompanyLogo] = React.useState('');

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const getCompanyProps = async () => {
        try {
            const response = await getCompanyProperties(companyUrl);
            if (response.status === 200) {
                await sleep(2000);
                setCompanyProperties(response.data);
                Cookies.set("companyProperties", JSON.stringify(response.data));
            } else {
                console.error("Erro ao obter as propriedades da empresa:", response.statusText);
            }
        } catch (error) {
            console.error("Erro ao obter as propriedades da empresa:", error);
        }
    }

    const updateCompanyProps = async () => {
        if (!validarHoraCompleta(companyProperties.cancelTime) && companyLogo === '') {
            toast.error("O tempo para cancelamento deve estar no formato HH:mm");
            return;
        }
        Cookies.set("companyProperties", JSON.stringify(companyProperties));
        try {
            const response = await updateCompanyProperties(companyUrl, companyProperties);
            if (response.status === 200) {
                toast.success("Configurações atualizadas com sucesso!");
            } else {
                toast.error(response.data);
            }
        } catch (error) {
            toast.error(error);
        }
        try {
            const response = await uploadLogo(companyUrl, companyLogo);
            if (response.status === 200) {
                toast.success("Logo salvo com sucesso!");
            } else {
                toast.error(response.data);
            }
        } catch (error) {
            toast.error(error);
        }
    }

    const handleCompanyProperties = (parameter, value) => {
        setCompanyProperties((prev) => ({
            ...prev,
            [parameter]: value
        }));
    }

    useEffect(() => {
        if (isAvailableLogin()) {
            if (companyProperties === undefined) {
                getCompanyProps();
            }
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
                        $backgroundcolor="#fff"
                        $borderradius="1rem"
                    >
                        {loading && !companyProperties &&
                            <span className="loader"></span>
                        }
                        {!loading && companyProperties &&
                            <>
                                <Title
                                    $padding="1rem"
                                    $fontweight="600"
                                    $fontsize="1.25rem"
                                    $color="#6A5ACD"
                                    $texttransform="uppercase"
                                >
                                    Configurações
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
                                        <label style={{ fontSize: "0.8rem" }}>Tempo anterior ao horário para cliente poder cancelar:</label>
                                        <input
                                            type="text"
                                            placeholder='Digite o tempo no formato HH:mm'
                                            value={paraHoraSemSegundos(companyProperties.cancelTime)}
                                            onChange={(e) => handleCompanyProperties('cancelTime', paraHoraCompleta(e.target.value))}
                                            style={{ border: "1px solid #f3f3f3", marginTop: "1rem" }}
                                        />
                                        <label style={{ fontSize: "0.8rem" }}>Alterar logo da empresa:</label>
                                        <input
                                            type="file"
                                            style={{ border: 'none', boxShadow: 'none', marginBottom: '1rem', paddingLeft: '0' }}
                                            name={companyLogo !== '' ? companyLogo.name : 'logo'}
                                            onChange={(event) => {
                                                setCompanyLogo(event.target.files[0]);
                                            }}
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
                                                onClick={updateCompanyProps}>
                                                Salvar alterações
                                            </Button>
                                        </Container>
                                    </form>
                                </Container>
                            </>
                        }
                    </Container>
                    <ToastContainer position="top-right" autoClose={3000} closeButton={false} />
                </Sidebar>
            </Container>
        </>
    );
}