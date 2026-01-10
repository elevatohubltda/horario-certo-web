import React, { useEffect } from "react";
import styled from "styled-components";
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
import {
  formatSchedulesToISO,
  maskTime,
  paraHoraCompleta
} from "../util/format";
import { XIcon } from "lucide-react";
import { createSchedule } from "../services/endpoints/companySchedule";
import DatePicker from "../components/datePicker";
import { getNowInBrazilDate } from "../util/date";

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
  padding: 0.5rem;
  border-top: 1px solid var(--color-sage);
  background-color: #fff;
  color: var(--color-dark);
  font-size: 0.85rem;

  &:focus {
    outline: none;
    border-color: var(--color-dark);
  }
`;

const ButtonsGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  margin: 1rem 0 0.5rem 0;
`;

const Badge = styled.div`
  display: flex;
  align-items: center;
  border-radius: 0.5rem;
  color: var(--color-dark);
  font-size: 0.75rem;
`;

const BadgeContent = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid var(--color-sage);
  border-radius: 0.5rem;
  padding: 0.2rem 0.5rem;
  color: var(--color-dark);
  font-size: 0.75rem;
`;

const RemoveIcon = styled(XIcon)`
  background: #d9534f;
  color: #fff;
  border-radius: 50%;
  cursor: pointer;
  margin-top: -1.2rem;
  margin-left: -0.6rem
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

export default function MySchedule() {
  const companyUrl = Cookies.get("companyUrl");
  const companyInfo = JSON.parse(Cookies.get("companyInfo"));
  const [loading, setLoading] = React.useState(true);
  const [mobile, setMobile] = React.useState();
  const navigate = useNavigate();

  const [scheduleData, setScheduleData] = React.useState({
    date: getNowInBrazilDate(),
    openTime: "",
    closeTime: "",
    durationTime: "",
    interval: []
  });

  const [interval, setInterval] = React.useState({});
  const [schedule, setSchedule] = React.useState([]);

  const insertInterval = () => {
    if (!interval?.start || !interval?.end) {
      toast.error("Preencha os horários do intervalo.");
      return;
    }

    setScheduleData(prev => ({
      ...prev,
      interval: [...prev.interval, interval]
    }));

    setInterval({ start: "", end: "" });
  };

  const removeInterval = intervalItem => {
    setScheduleData(prev => ({
      ...prev,
      interval: prev.interval.filter(item => item !== intervalItem)
    }));
  };

  const generateSchedule = () => {
    const timeSlots = generateTimeSlots({
      openTime: scheduleData.openTime,
      closeTime: scheduleData.closeTime,
      durationTime: scheduleData.durationTime,
      interval: scheduleData.interval
    });
    setSchedule(timeSlots);
  };

  const removeSchedule = item => {
    setSchedule(prev => prev.filter(scheduleItem => scheduleItem !== item));
  };

  const saveSchedule = async () => {
    const scheduleISO = formatSchedulesToISO({
      date: scheduleData.date.toLocaleDateString("pt-BR"),
      schedules: schedule
    });

    try {
      const response = await createSchedule(companyUrl, scheduleISO);
      if (response.status === 200) {
        toast.success("Horários salvos com sucesso!");
      }
    } catch (error) {
      console.error(error);
    }
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
        $width={!mobile ? "100%" : "90%"}
        $display="flex"
        $flexdirection="column"
        $padding={!mobile ? "0" : "1rem"}
        $margin="0"
        $backgroundcolor="transparent"
      >
        <Sidebar>
          <Container
            $width="90%"
            $backgroundcolor="var(--color-background)"
            $borderradius="0 1rem 2rem 1rem"
            $padding="0"
            $display="flex"
            $flexdirection="column"
            $boxshadow="none"
          >
            {loading && <span className="loader" />}

            {!loading && (
              <>
                <Title
                  $padding="1rem"
                  $fontweight="600"
                  $fontsize="1.25rem"
                  $color="var(--color-dark)"
                >
                  Criar agendamentos
                </Title>

                <Separator
                  $width="calc(100% - 2rem)"
                  $bordercolor="var(--color-dark)"
                  $margin="0 1rem 1rem 1rem"
                />

                <Form>
                  <Label>Data:</Label>
                  <DatePicker
                    value={scheduleData.date}
                    onChange={e =>
                      setScheduleData(prev => ({ ...prev, date: e }))
                    }
                  />

                  <Label>Horário de abertura:</Label>
                  <Input
                    value={maskTime(scheduleData.openTime)}
                    onChange={e =>
                      setScheduleData(prev => ({
                        ...prev,
                        openTime: paraHoraCompleta(e.target.value)
                      }))
                    }
                  />

                  <Label>Horário de fechamento:</Label>
                  <Input
                    value={maskTime(scheduleData.closeTime)}
                    onChange={e =>
                      setScheduleData(prev => ({
                        ...prev,
                        closeTime: e.target.value
                      }))
                    }
                  />

                  <Label>Duração (minutos):</Label>
                  <Input
                    value={scheduleData.durationTime}
                    onChange={e =>
                      setScheduleData(prev => ({
                        ...prev,
                        durationTime: e.target.value
                      }))
                    }
                  />

                  <Label>Intervalo início:</Label>
                  <Input
                    value={maskTime(interval.start || "")}
                    onChange={e =>
                      setInterval(prev => ({
                        ...prev,
                        start: e.target.value
                      }))
                    }
                  />

                  <Label>Intervalo fim:</Label>
                  <Input
                    value={maskTime(interval.end || "")}
                    onChange={e =>
                      setInterval(prev => ({
                        ...prev,
                        end: e.target.value
                      }))
                    }
                  />

                  <ButtonsGroup>
                    <Button
                      style={{
                        backgroundColor: "var(--color-olive)",
                        borderColor: "var(--color-brown)",
                      }}
                      onClick={insertInterval}
                    >
                      Inserir intervalo
                    </Button>

                    <Button
                      style={{
                        backgroundColor: "var(--color-olive)",
                        borderColor: "var(--color-brown)",
                      }}
                      onClick={() =>
                        setScheduleData(prev => ({ ...prev, interval: [] }))
                      }
                    >
                      Limpar intervalos
                    </Button>

                    <Button
                      style={{
                        backgroundColor: "var(--color-olive)",
                        borderColor: "var(--color-brown)",
                      }}
                      onClick={generateSchedule}
                    >
                      Gerar horários
                    </Button>

                    <Button
                      style={{
                        backgroundColor: "var(--color-olive)",
                        borderColor: "var(--color-brown)",
                      }}
                      onClick={() => setSchedule([])}
                    >
                      Limpar horários
                    </Button>
                  </ButtonsGroup>

                  {scheduleData.interval.length > 0 && (
                    <>
                      <Separator
                        $width="100%"
                        $bordercolor="var(--color-dark)"
                      />
                      <Label>Meus intervalos:</Label>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        {scheduleData.interval.map((item, index) => (
                          <Badge key={index}>
                            <BadgeContent>
                                {item.start} - {item.end}
                            </BadgeContent>
                            <RemoveIcon
                              size={12}
                              onClick={() => removeInterval(item)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </>
                  )}

                  {schedule.length > 0 && (
                    <>
                      <Label style={{ marginTop: "1rem" }}>
                        Horários gerados:
                      </Label>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        {schedule.map((item, index) => (
                          <Badge key={index}>
                            <BadgeContent>
                                {item}
                            </BadgeContent>
                            <RemoveIcon
                              size={12}
                              onClick={() => removeSchedule(item)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </>
                  )}

                  <Separator
                    $width="100%"
                    $bordercolor="var(--color-dark)"
                  />

                  <Actions>
                    <Button
                      style={{
                        backgroundColor: "var(--color-sage)",
                        borderColor: "var(--color-sage)"
                      }}
                      onClick={saveSchedule}
                    >
                      Salvar
                    </Button>
                  </Actions>
                </Form>
              </>
            )}
          </Container>

          <ToastContainer position="top-right" autoClose={3000} />
        </Sidebar>
      </Container>
    </>
  );
}
