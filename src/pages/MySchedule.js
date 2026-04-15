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
import { XIcon, Calendar, PauseCircle, Clock, Plus, Trash2, Timer, Save, AlertCircle } from "lucide-react";
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
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const Label = styled.label`
  font-size: 0.82rem;
  font-weight: 600;
  color: #546151;
  margin-bottom: 0.55rem;
  display: block;
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const Input = styled.input`
  margin-top: 0.5rem;
  padding: 0.6rem;
  border: 1px solid rgb(243, 243, 243);
  border-top: 1px solid var(--color-sage);
  background-color: #fff;
  color: var(--color-dark);
  font-size: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--color-sage);
  }
`;

const Section = styled.section`
  padding: 2rem;
  background: linear-gradient(135deg, #ffffff 0%, #fafbf9 100%);
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }

  &:last-of-type {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  margin: 0 0 1.5rem 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #131313;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  letter-spacing: 0.5px;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e8e8e8;

  svg {
    color: #546151;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;

  > div {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }
`;

const ButtonsGroup = styled.div`
  display: flex;
  gap: 0.85rem;
  flex-wrap: wrap;
  margin: 1.75rem 0 0 0;
`;

const PrimaryButton = styled(Button)`
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 0.6rem !important;
  background: var(--color-olive) !important;
  border: none !important;
  color: #fff !important;
  padding: 0.75rem 1.35rem !important;
  border-radius: 8px !important;
  font-size: 0.9rem !important;
  font-weight: 600 !important;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;

  &:hover:not(:disabled) {
    background: var(--color-brown) !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15) !important;
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    background: #d0d0d0 !important;
    opacity: 0.65;
    cursor: not-allowed;
    box-shadow: none !important;
  }
`;

const ChipContainer = styled.div`
  display: flex;
  gap: 0.85rem;
  flex-wrap: wrap;
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 1px solid #e8e8e8;
`;

const Chip = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: linear-gradient(135deg, #f0f3ed 0%, #e8ebe5 100%);
  border: 1.5px solid #d7dbd4;
  border-radius: 20px;
  padding: 0.65rem 1rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: #546151;
  transition: all 0.2s ease;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

  &:hover {
    background: linear-gradient(135deg, #e8ebe5 0%, #e0e3dc 100%);
    border-color: #c9ccc6;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  span {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem;
  color: #a0a89d;
  transition: all 0.2s ease;
  border-radius: 50%;

  &:hover {
    color: #d9534f;
    background: rgba(217, 83, 79, 0.1);
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 2px solid #e8e8e8;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  padding: 3.5rem 2rem;
  background: linear-gradient(180deg, #f5f7f3 0%, #eff1ed 100%);
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  text-align: center;
  color: #a0a89d;
  margin-top: 1.5rem;
`;

const EmptyStateIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e8ebe5 0%, #dfe2d9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #546151;
  font-size: 2.2rem;
`;

const EmptyStateText = styled.p`
  margin: 0;
  font-size: 0.95rem;
  color: #546151;
  font-weight: 600;
  letter-spacing: 0.3px;
`;

const EmptyStateHint = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: #a0a89d;
  max-width: 320px;
  line-height: 1.5;
`;

const GenerateButton = styled(PrimaryButton)`
  background: linear-gradient(135deg, #546151 0%, #3d4a38 100%) !important;
  border: none !important;
  box-shadow: 0 6px 16px rgba(84, 97, 81, 0.3) !important;
  font-size: 1rem !important;
  padding: 0.9rem 2rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.3px !important;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #3d4a38 0%, #2d3628 100%) !important;
    box-shadow: 0 8px 24px rgba(84, 97, 81, 0.4) !important;
    transform: translateY(-3px) !important;
  }

  &:active:not(:disabled) {
    transform: translateY(-1px) !important;
  }
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
    // Validar campos obrigatórios
    if (!scheduleData.openTime) {
      toast.error("Preencha o horário de abertura.");
      return;
    }
    if (!scheduleData.closeTime) {
      toast.error("Preencha o horário de fechamento.");
      return;
    }
    if (!scheduleData.durationTime) {
      toast.error("Preencha a duração do agendamento.");
      return;
    }

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
      if(error.status === 409){
        toast.error(error.response.data);
      } else {
        console.log(error);
      }
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
        $width="100%"
        $display="flex"
        $flexdirection="column"
        $padding={!mobile ? "0" : "1rem"}
        $margin="0"
        $backgroundcolor="transparent"
        $boxshadow="none"
      >
        <Sidebar>
          {loading && <span className="loader" />}

          {!loading && (
            <>
              <Title
                $padding="1.5rem 1rem 0.5rem 1rem"
                $margin="1.5rem 0 0.5rem 0"
                $fontweight="700"
                $width="initial"
                $fontsize="2rem"
                $color="#131313"
              >
                Criar agendamentos
              </Title>

              <Separator
                $width="calc(100% - 2rem)"
                $bordercolor="#e8e8e8"
                $margin="0.75rem 1rem 1.5rem 1rem"
                $style="solid"
              />

              <Form>
                {/* SEÇÃO 1: Configuração básica */}
                <Section>
                  <SectionTitle>
                    <Calendar size={20} />
                    Configuração básica
                  </SectionTitle>
                  
                  <FormGrid>
                    <div>
                      <Label>Data:</Label>
                      <DatePicker
                        value={scheduleData.date}
                        onChange={e =>
                          setScheduleData(prev => ({ ...prev, date: e }))
                        }
                      />
                    </div>

                    <div>
                      <Label>Horário de abertura:</Label>
                      <Input
                        placeholder="00:00"
                        value={maskTime(scheduleData.openTime)}
                        onChange={e =>
                          setScheduleData(prev => ({
                            ...prev,
                            openTime: paraHoraCompleta(e.target.value)
                          }))
                        }
                      />
                    </div>

                    <div>
                      <Label>Horário de fechamento:</Label>
                      <Input
                        placeholder="23:59"
                        value={maskTime(scheduleData.closeTime)}
                        onChange={e =>
                          setScheduleData(prev => ({
                            ...prev,
                            closeTime: e.target.value
                          }))
                        }
                      />
                    </div>

                    <div>
                      <Label>Duração do agendamento (minutos):</Label>
                      <Input
                        type="number"
                        placeholder="30"
                        value={scheduleData.durationTime}
                        onChange={e =>
                          setScheduleData(prev => ({
                            ...prev,
                            durationTime: e.target.value
                          }))
                        }
                      />
                    </div>
                  </FormGrid>
                </Section>

                {/* SEÇÃO 2: Intervalos */}
                <Section>
                  <SectionTitle>
                    <PauseCircle size={20} />
                    Intervalos
                  </SectionTitle>
                  
                  <FormGrid>
                    <div>
                      <Label style={{ fontSize: '0.75rem', marginBottom: '0.45rem', textTransform: 'uppercase' }}>Início:</Label>
                      <Input
                        placeholder="00:00"
                        value={maskTime(interval.start || "")}
                        onChange={e =>
                          setInterval(prev => ({
                            ...prev,
                            start: e.target.value
                          }))
                        }
                      />
                    </div>

                    <div>
                      <Label style={{ fontSize: '0.75rem', marginBottom: '0.45rem', textTransform: 'uppercase' }}>Fim:</Label>
                      <Input
                        placeholder="00:00"
                        value={maskTime(interval.end || "")}
                        onChange={e =>
                          setInterval(prev => ({
                            ...prev,
                            end: e.target.value
                          }))
                        }
                      />
                    </div>
                  </FormGrid>

                  <ButtonsGroup>
                    <PrimaryButton 
                      type="button"
                      onClick={insertInterval}
                    >
                      <Plus size={16} />
                      Inserir intervalo
                    </PrimaryButton>

                    {scheduleData.interval.length > 0 && (
                      <PrimaryButton
                        type="button"
                        style={{
                          backgroundColor: "#666",
                          borderColor: "#666"
                        }}
                        onClick={() =>
                          setScheduleData(prev => ({ ...prev, interval: [] }))
                        }
                      >
                        <Trash2 size={16} />
                        Limpar todos
                      </PrimaryButton>
                    )}
                  </ButtonsGroup>

                  {scheduleData.interval.length > 0 && (
                    <>
                      <Label style={{ marginTop: '1.5rem', marginBottom: '1rem', fontWeight: '700', fontSize: '0.9rem', color: '#131313' }}>
                        Intervalos adicionados:
                      </Label>
                      <ChipContainer>
                        {scheduleData.interval.map((item, index) => (
                          <Chip key={index}>
                            <Timer size={14} style={{ marginRight: '0.3rem', flexShrink: 0 }} />
                            <span>{item.start} - {item.end}</span>
                            <RemoveButton
                              type="button"
                              onClick={() => removeInterval(item)}
                              title="Remover intervalo"
                            >
                              <XIcon size={14} />
                            </RemoveButton>
                          </Chip>
                        ))}
                      </ChipContainer>
                    </>
                  )}
                </Section>

                {/* SEÇÃO 3: Gerar e gerenciar horários */}
                <Section>
                  <SectionTitle>
                    <Clock size={20} />
                    Horários disponíveis
                  </SectionTitle>
                  
                  {schedule.length === 0 && (
                    <>
                      <ButtonsGroup style={{ marginTop: '0.5rem', marginBottom: '0' }}>
                        <GenerateButton
                          type="button"
                          onClick={generateSchedule}
                        >
                          <Clock size={20} />
                          Gerar horários
                        </GenerateButton>
                      </ButtonsGroup>
                      <EmptyState>
                        <EmptyStateIcon>
                          <AlertCircle size={40} />
                        </EmptyStateIcon>
                        <div>
                          <EmptyStateText>Nenhum horário gerado</EmptyStateText>
                          <EmptyStateHint>Clique no botão acima para gerar os horários disponíveis para agendamentos</EmptyStateHint>
                        </div>
                      </EmptyState>
                    </>
                  )}

                  {schedule.length > 0 && (
                    <>
                      <ButtonsGroup>
                        <PrimaryButton
                          type="button"
                          style={{
                            backgroundColor: "#666",
                            borderColor: "#666"
                          }}
                          onClick={() => setSchedule([])}
                        >
                          <Trash2 size={16} />
                          Limpar horários
                        </PrimaryButton>
                      </ButtonsGroup>
                      <Label style={{ marginTop: '1.5rem', marginBottom: '1rem', fontWeight: '700', fontSize: '0.9rem', color: '#131313' }}>
                        {schedule.length} horários gerados:
                      </Label>
                      <ChipContainer>
                        {schedule.map((item, index) => (
                          <Chip key={index}>
                            <span>{item}</span>
                            <RemoveButton
                              type="button"
                              onClick={() => removeSchedule(item)}
                              title="Remover horário"
                            >
                              <XIcon size={14} />
                            </RemoveButton>
                          </Chip>
                        ))}
                      </ChipContainer>
                    </>
                  )}
                </Section>

                {/* AÇÕES FINAIS */}
                <Actions>
                  <PrimaryButton
                    type="button"
                    style={{
                      backgroundColor: "var(--color-sage)",
                      borderColor: "var(--color-sage)"
                    }}
                    disabled={schedule.length === 0}
                    onClick={saveSchedule}
                  >
                    <Save size={16} />
                    Salvar agendamentos
                  </PrimaryButton>
                </Actions>
              </Form>
              </>
            )}
          </Sidebar>

          <ToastContainer 
            position={mobile ? "bottom-center" : "top-right"} 
            autoClose={3000}
            style={mobile ? { margin: '0 5% 1rem 5%', width: '90%' } : undefined}
          />
        </Container>
    </>
  );
}
