import React, { useEffect } from "react";
import styled from "styled-components";
import "../styles/index.css";
import Cookies from "js-cookie";
import { PageLayout, Message } from "../components/admin";
import { isAvailableLogin, redirectToLogin } from "../util/auth";
import { useNavigate } from "react-router-dom";
import { generateTimeSlots, isMobile } from "../util/util";
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
  width: 100%;
  background: transparent;
  box-shadow: none;
  border: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const Label = styled.label`
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ui-text-secondary);
  margin-bottom: 0.35rem;
  display: block;
`;

const Input = styled.input`
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--ui-input-border);
  border-radius: var(--ui-radius-sm);
  background-color: #fff;
  color: var(--ui-text);
  font-size: 0.9rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--ui-primary);
  }
`;

const Section = styled.section`
  padding: 1.5rem;
  background: #fff;
  border-radius: var(--ui-radius);
  border: 1px solid var(--ui-border);
  margin-bottom: 1.25rem;
  box-shadow: var(--ui-card-shadow);

  &:last-of-type {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  margin: 0 0 1.25rem 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--ui-text);
  display: flex;
  align-items: center;
  gap: 0.6rem;

  svg {
    color: var(--ui-muted);
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1rem;

  > div {
    display: flex;
    flex-direction: column;
  }
`;

const ButtonsGroup = styled.div`
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin: 1rem 0 0 0;
`;

const PrimaryButton = styled(Button)`
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 0.5rem !important;
  background: var(--ui-primary) !important;
  border: 1px solid var(--ui-primary) !important;
  color: #fff !important;
  padding: 0.6rem 1.25rem !important;
  border-radius: 999px !important;
  font-size: 0.9rem !important;
  font-weight: 600 !important;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: var(--ui-primary-hover) !important;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(PrimaryButton)`
  background: #fff !important;
  border: 1px solid var(--ui-input-border) !important;
  color: var(--ui-text) !important;

  &:hover:not(:disabled) {
    background: #f3f4f6 !important;
  }
`;

const ChipContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const Chip = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: #f3f4f6;
  border: 1px solid var(--ui-border);
  border-radius: 999px;
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--ui-text-secondary);

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
  padding: 0.15rem;
  color: var(--ui-muted);
  border-radius: 50%;

  &:hover {
    color: var(--ui-danger);
    background: #fef2f2;
  }
`;

const ListLabel = styled.p`
  margin: 1.25rem 0 0.75rem 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--ui-text);
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2.5rem 1.5rem;
  border: 1px dashed var(--ui-input-border);
  border-radius: var(--ui-radius);
  text-align: center;
  margin-top: 1.25rem;
  color: var(--ui-muted);
`;

const EmptyStateText = styled.p`
  margin: 0;
  font-size: 0.95rem;
  color: var(--ui-text);
  font-weight: 600;
`;

const EmptyStateHint = styled.p`
  margin: 0.25rem 0 0 0;
  font-size: 0.85rem;
  color: var(--ui-muted);
  max-width: 320px;
  line-height: 1.5;
`;

/* =======================
   Component
======================= */

export default function MySchedule() {
  const companyUrl = Cookies.get("companyUrl");
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
      redirectToLogin(navigate);
    }
  }, [companyUrl, navigate]);

  return (
    <>
      <PageLayout title="Criar agendamentos" subtitle="Gere os horários disponíveis de um dia específico.">
          {loading && <Message>Carregando...</Message>}

          {!loading && (
            <>

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
                      <Label>Início:</Label>
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
                      <Label>Fim:</Label>
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
                      <SecondaryButton
                        type="button"
                        onClick={() =>
                          setScheduleData(prev => ({ ...prev, interval: [] }))
                        }
                      >
                        <Trash2 size={16} />
                        Limpar todos
                      </SecondaryButton>
                    )}
                  </ButtonsGroup>

                  {scheduleData.interval.length > 0 && (
                    <>
                      <ListLabel>Intervalos adicionados:</ListLabel>
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
                      <ButtonsGroup style={{ marginTop: 0 }}>
                        <PrimaryButton
                          type="button"
                          onClick={generateSchedule}
                        >
                          <Clock size={16} />
                          Gerar horários
                        </PrimaryButton>
                      </ButtonsGroup>
                      <EmptyState>
                        <AlertCircle size={32} />
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
                        <SecondaryButton
                          type="button"
                          onClick={() => setSchedule([])}
                        >
                          <Trash2 size={16} />
                          Limpar horários
                        </SecondaryButton>
                      </ButtonsGroup>
                      <ListLabel>{schedule.length} horários gerados:</ListLabel>
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
          <ToastContainer
            position={mobile ? "bottom-center" : "top-right"}
            autoClose={3000}
            style={mobile ? { margin: '0 5% 1rem 5%', width: '90%' } : undefined}
          />
      </PageLayout>
    </>
  );
}
