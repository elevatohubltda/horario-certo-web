import React, { useEffect } from "react";
import "../styles/index.css";
import Topbar from "../components/topbar";
import { Container } from "../components/container/style";
import Cookies from "js-cookie";
import Sidebar from "../components/sidebar";
import { isAvailableLogin } from "../util/auth";
import { useNavigate } from "react-router-dom";
import { generateTimeSlots, isMobile } from "../util/util";
import { Title } from "../components/title";
import { Separator } from "../components/separator/style";
import { ToastContainer, toast } from "react-toastify";
import { Button } from "react-bootstrap";
import { formatSchedulesToISO, maskTime, paraHoraCompleta } from "../util/format";
import { XIcon } from "lucide-react";
import { createSchedule } from "../services/endpoints/companySchedule";

export default function MySchedule() {
    const companyUrl = Cookies.get("companyUrl");
    const companyInfo = JSON.parse(Cookies.get("companyInfo"));
    const [loading, setLoading] = React.useState(true);
    const [mobile, setMobile] = React.useState();
    const navigate = useNavigate();
    const [scheduleData, setScheduleData] = React.useState(
        {
            date: new Date().toISOString().split('T')[0],
            openTime: "",
            closeTime: "",
            durationTime: "",
            interval: []
        }
    );
    const [interval, setInterval] = React.useState({});
    const [schedule, setSchedule] = React.useState([]);

    const insertInterval = () => {
        if (!interval?.start || !interval?.end) {
            toast.error("Por favor, preencha os horários de abertura e fechamento antes de inserir um intervalo.");
            return;
        }
        setScheduleData((prev) => ({
            ...prev,
            interval: [
                ...prev.interval, 
                interval
            ]
        }));
        setInterval({
            start: "",
            end: ""
        });
    }

    function removeInterval(interval) {
        setScheduleData(prevData => ({
            ...prevData,
            interval: prevData.interval.filter(item => item !== interval)
        }));
    }

    const handleScheduleData = (parameter, value) => {
        setScheduleData((prev) => ({
            ...prev,
            [parameter]: value
        }));
    }

    const handleInterval = (parameter, value) => {
        setInterval((prev) => ({
            ...prev,
            [parameter]: value
        }));
    }

    const generateSchedule= () => {
        const timeSlots = generateTimeSlots({
            openTime: scheduleData?.openTime,
            closeTime: scheduleData?.closeTime,
            durationTime: scheduleData?.durationTime,
            interval: scheduleData?.interval
        })
        setSchedule(timeSlots);
    }

    const removeSchedule = (item) => {
        setSchedule((prev) => prev.filter((scheduleItem) => scheduleItem !== item));
    }

    const saveSchedule = async () => {
        const scheduleISOFormat = formatSchedulesToISO({date: scheduleData.date, schedules: schedule});
        try {
            const response = await createSchedule(companyUrl, scheduleISOFormat);
            if (response.status === 200) {
                toast.success("Horários salvos com sucesso!");
            } else {
                console.error("Erro ao salvar os horários da empresa:", response.statusText);
            }
        } catch (error) {
            console.error("Erro ao salvar os horários da empresa:", error);
        }
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
                        {loading &&
                            <span className="loader"></span>
                        }
                        {!loading &&
                            <>
                                <Title
                                    $padding="1rem"
                                    $fontweight="600"
                                    $fontsize="1.25rem"
                                    $color="#6A5ACD"
                                    $texttransform="uppercase"
                                >
                                    Criar agendamentos
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
                                        <label style={{ fontSize: "0.8rem" }}>Data:</label>
                                        <input
                                            type="date"
                                            value={scheduleData?.date}
                                            onChange={(e) => handleScheduleData('date', e.target.value)}
                                            style={{ border: "1px solid #f3f3f3", marginTop: "1rem" }}
                                        />
                                        <label style={{ fontSize: "0.8rem" }}>Horário de abertura:</label>
                                        <input
                                            type="text"
                                            placeholder='Digite o horário no formato HH:mm'
                                            maxLength={5}
                                            value={maskTime(scheduleData?.openTime || '')}
                                            onChange={(e) => handleScheduleData('openTime', paraHoraCompleta(e.target.value))}
                                            style={{ border: "1px solid #f3f3f3", marginTop: "1rem" }}
                                        />
                                        <label style={{ fontSize: "0.8rem" }}>Horário de fechamento:</label>
                                        <input
                                            type="text"
                                            placeholder='Digite o horário no formato HH:mm'
                                            maxLength={5}
                                            value={maskTime(scheduleData?.closeTime || '')}
                                            onChange={(e) => handleScheduleData('closeTime', e.target.value)}
                                            style={{ border: "1px solid #f3f3f3", marginTop: "1rem" }}
                                        />
                                        <label style={{ fontSize: "0.8rem" }}>Tempo de duração do horário em minutos:</label>
                                        <input
                                            type="text"
                                            placeholder='Digite o tempo em minutos'
                                            value={scheduleData?.durationTime || ''}
                                            onChange={(e) => handleScheduleData('durationTime', e.target.value)}
                                            style={{ border: "1px solid #f3f3f3", marginTop: "1rem" }}
                                        />
                                        <label style={{ fontSize: "0.8rem" }}>Horário início do intervalo:</label>
                                        <input
                                            type="text"
                                            placeholder='Digite o horário no formato HH:mm'
                                            maxLength={5}
                                            value={maskTime(interval.start || '')}
                                            onChange={(e) => handleInterval('start', e.target.value)}
                                            style={{ border: "1px solid #f3f3f3", marginTop: "1rem" }}
                                        />
                                        <label style={{ fontSize: "0.8rem" }}>Horário fim do intervalo:</label>
                                        <input
                                            type="text"
                                            placeholder='Digite o horário no formato HH:mm'
                                            maxLength={5}
                                            value={maskTime(interval.end || '')}
                                            onChange={(e) => handleInterval('end', e.target.value)}
                                            style={{ border: "1px solid #f3f3f3", marginTop: "1rem" }}
                                        />
                                        <div style={{ 
                                            display: "flex", 
                                            margin: "1rem 0 .5rem 0", 
                                            gap: "1rem",
                                            flexWrap: "wrap",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}>
                                            <Button
                                                style={{ 
                                                    width: "max-content", 
                                                    fontSize: "0.8rem", 
                                                    padding: "0.5rem 1rem", 
                                                    backgroundColor: "#959595", 
                                                    borderColor: "#959595", 
                                                    color: "#fff" 
                                                }}
                                                onClick={insertInterval}
                                            >
                                                Inserir intervalo
                                            </Button>
                                            <Button
                                                style={{ 
                                                    width: "max-content", 
                                                    fontSize: "0.8rem", 
                                                    padding: "0.5rem 1rem", 
                                                    backgroundColor: "#959595", 
                                                    borderColor: "#959595", 
                                                    color: "#fff" 
                                                }}
                                                onClick={() => setScheduleData((prev) => ({ ...prev, interval: [] }))}
                                            >
                                                Limpar intervalo(s)
                                            </Button>
                                            <Button
                                                style={{ 
                                                    width: "max-content", 
                                                    fontSize: "0.8rem", 
                                                    padding: "0.5rem 1rem", 
                                                    backgroundColor: "#959595", 
                                                    borderColor: "#959595", 
                                                    color: "#fff" 
                                                }}
                                                onClick={() => generateSchedule()}
                                            >
                                                Gerar horários
                                            </Button>
                                            <Button
                                                style={{ 
                                                    width: "max-content", 
                                                    fontSize: "0.8rem", 
                                                    padding: "0.5rem 1rem", 
                                                    backgroundColor: "#959595", 
                                                    borderColor: "#959595", 
                                                    color: "#fff" 
                                                }}
                                                onClick={() => setSchedule([])}
                                            >
                                                Limpar horários
                                            </Button>
                                        </div>
                                        {
                                            scheduleData.interval.length > 0 &&
                                            <>
                                                <Separator $width="100%" $bordercolor="#ccc" />
                                                <label style={{ fontSize: "0.8rem" }}>Meus intervalos:</label>
                                                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap"}}>
                                                    {scheduleData.interval.map((item, index) => (
                                                        <div key={index} style={{ marginTop: "1rem", display: "flex", alignItems: "center"}}>
                                                            <span
                                                                style={{ 
                                                                    justifyContent: "center", 
                                                                    width: "max-content", 
                                                                    display: "flex", 
                                                                    alignItems: "center",
                                                                    border: "1px solid #6A5ACD",
                                                                    borderRadius: "0.5rem",
                                                                    padding: "0 0.5rem",
                                                                }}
                                                            >
                                                                {item.start} - {item.end}
                                                            </span>
                                                            <XIcon
                                                                size={12} 
                                                                style={{background: '#f10f0f', borderRadius: '10px', color: '#fff', marginLeft: "-0.5rem", marginTop: "-1.2rem", cursor: 'pointer'}}
                                                                onClick={() => removeInterval(item)}
                                                            />
                                                        </div>
                                                    ))
                                                    }
                                                </div>
                                            </>
                                        }
                                        {
                                            schedule.length > 0 && 
                                            <>
                                                <label style={{ fontSize: "0.8rem", marginTop: "1.5rem" }}>Horários gerados:</label>
                                                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
                                                    {schedule.map((item, index) => (
                                                        <div key={index} style={{ 
                                                            justifyContent: "center", 
                                                            width: "max-content", 
                                                            display: "flex", 
                                                            alignItems: "center",
                                                            border: "1px solid #6A5ACD",
                                                            borderRadius: "0.5rem",
                                                            paddingLeft: "0.5rem",
                                                        }}>
                                                            {item}
                                                            <XIcon
                                                                size={12} 
                                                                style={{
                                                                    background: '#f10f0f', 
                                                                    borderRadius: '10px', 
                                                                    marginTop: "-20px",
                                                                    marginRight: "-5px",
                                                                    color: '#fff',
                                                                    cursor: 'pointer'
                                                                }}
                                                                onClick={() => removeSchedule(item)}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        }
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
                                                onClick={saveSchedule}
                                            >
                                                Salvar
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