import React, { useEffect, useState } from "react";
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
import { XIcon, Plus, Save, Clock } from "lucide-react";
import { maskTime } from "../util/format";
import {
  getWeeklyScheduleRules,
  saveWeeklyScheduleRules
} from "../services/endpoints/weeklyScheduleRule";

const DAYS = [
  { dayOfWeek: 1, label: "Segunda-feira" },
  { dayOfWeek: 2, label: "Terça-feira" },
  { dayOfWeek: 3, label: "Quarta-feira" },
  { dayOfWeek: 4, label: "Quinta-feira" },
  { dayOfWeek: 5, label: "Sexta-feira" },
  { dayOfWeek: 6, label: "Sábado" },
  { dayOfWeek: 7, label: "Domingo" }
];

const defaultRule = (dayOfWeek) => ({
  dayOfWeek,
  openTime: "08:00",
  closeTime: "18:00",
  active: false,
  intervals: []
});

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
  gap: 1.5rem;
`;

const DayCard = styled.section`
  padding: 1.5rem;
  background: linear-gradient(135deg, #ffffff 0%, #fafbf9 100%);
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const DayHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const DayTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #131313;
`;

const ActiveSwitch = styled.button`
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 46px;
  height: 26px;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: ${({ $active }) => ($active ? "#2d8cf0" : "#d6ddd6")};
  cursor: pointer;
  transition: background-color 0.2s ease;
`;

const SwitchThumb = styled.span`
  position: absolute;
  top: 3px;
  left: ${({ $active }) => ($active ? "23px" : "3px")};
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  transition: left 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1.25rem;

  > div {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }
`;

const Label = styled.label`
  font-size: 0.75rem;
  font-weight: 600;
  color: #546151;
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const Input = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 0.55rem;
  border: 1px solid rgb(243, 243, 243);
  border-top: 1px solid var(--color-sage);
  background-color: #fff;
  color: var(--color-dark);
  font-size: 0.95rem;

  &:focus {
    outline: none;
    border-color: var(--color-sage);
  }
`;

const ChipContainer = styled.div`
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin-top: 1rem;
`;

const Chip = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #f0f3ed 0%, #e8ebe5 100%);
  border: 1.5px solid #d7dbd4;
  border-radius: 20px;
  padding: 0.5rem 0.85rem;
  font-size: 0.8rem;
  color: #546151;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #a0a89d;

  &:hover {
    color: #d9534f;
  }
`;

const IntervalRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 1.25rem;
  margin-top: 1rem;
  flex-wrap: wrap;

  > div {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    flex: 1 1 160px;
    min-width: 140px;
  }
`;

const AddIntervalButton = styled(Button)`
  display: flex !important;
  height: 40px;
  margin-bottom: 1rem;
  align-items: center !important;
  justify-content: center !important;
  gap: 0.4rem !important;
  background: var(--color-olive) !important;
  border: none !important;
  color: #fff !important;
  padding: 0.6rem 1rem !important;
  border-radius: 8px !important;
  font-size: 0.8rem !important;
  white-space: nowrap;
  flex-shrink: 0;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const SaveButton = styled(Button)`
  display: flex !important;
  align-items: center !important;
  gap: 0.6rem !important;
  background: var(--color-sage) !important;
  border: none !important;
  color: #fff !important;
  padding: 0.75rem 1.5rem !important;
  border-radius: 8px !important;
  font-weight: 600 !important;
`;

/* =======================
   Component
======================= */

const TOAST_CONTAINER_ID = "weekly-schedule-config-toast";

export default function WeeklyScheduleConfig() {
  const companyUrl = Cookies.get("companyUrl");
  const companyInfo = JSON.parse(Cookies.get("companyInfo") || "{}");
  const [loading, setLoading] = React.useState(true);
  const [mobile, setMobile] = React.useState();
  const [saving, setSaving] = React.useState(false);
  const navigate = useNavigate();

  const [rules, setRules] = useState(DAYS.map((d) => defaultRule(d.dayOfWeek)));
  const [intervalDraft, setIntervalDraft] = useState({});

  const fetchRules = async () => {
    try {
      const response = await getWeeklyScheduleRules(companyUrl);
      const loaded = response.data || [];
      setRules(
        DAYS.map((d) => {
          const found = loaded.find((r) => r.dayOfWeek === d.dayOfWeek);
          if (!found) return defaultRule(d.dayOfWeek);
          return {
            dayOfWeek: found.dayOfWeek,
            openTime: found.openTime.slice(0, 5),
            closeTime: found.closeTime.slice(0, 5),
            active: found.active,
            intervals: found.intervals.map((i) => ({
              startTime: i.startTime.slice(0, 5),
              endTime: i.endTime.slice(0, 5)
            }))
          };
        })
      );
    } catch (error) {
      toast.error("Erro ao buscar o horário semanal.", { containerId: TOAST_CONTAINER_ID });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAvailableLogin()) {
      setMobile(isMobile());
      fetchRules();
    } else {
      navigate("/" + companyUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyUrl, navigate]);

  const updateRule = (dayOfWeek, patch) => {
    setRules((prev) =>
      prev.map((r) => (r.dayOfWeek === dayOfWeek ? { ...r, ...patch } : r))
    );
  };

  const addInterval = (dayOfWeek) => {
    const draft = intervalDraft[dayOfWeek];
    if (!draft?.start || !draft?.end) {
      toast.error("Preencha os horários do intervalo.", { containerId: TOAST_CONTAINER_ID });
      return;
    }
    updateRule(dayOfWeek, {
      intervals: [
        ...rules.find((r) => r.dayOfWeek === dayOfWeek).intervals,
        { startTime: draft.start, endTime: draft.end }
      ]
    });
    setIntervalDraft((prev) => ({ ...prev, [dayOfWeek]: { start: "", end: "" } }));
  };

  const removeInterval = (dayOfWeek, interval) => {
    updateRule(dayOfWeek, {
      intervals: rules
        .find((r) => r.dayOfWeek === dayOfWeek)
        .intervals.filter((i) => i !== interval)
    });
  };

  const handleSave = async () => {
    for (const rule of rules) {
      if (rule.openTime >= rule.closeTime) {
        toast.error("Horário de abertura deve ser anterior ao de fechamento.", { containerId: TOAST_CONTAINER_ID });
        return;
      }
    }
    setSaving(true);
    try {
      const payload = rules.map((r) => ({
        dayOfWeek: r.dayOfWeek,
        openTime: `${r.openTime}:00`,
        closeTime: `${r.closeTime}:00`,
        active: r.active,
        intervals: r.intervals.map((i) => ({
          startTime: `${i.startTime}:00`,
          endTime: `${i.endTime}:00`
        }))
      }));
      const response = await saveWeeklyScheduleRules(companyUrl, payload);
      if (response.status === 200) {
        toast.success("Horário semanal salvo com sucesso!", { containerId: TOAST_CONTAINER_ID });
      }
    } catch (error) {
      toast.error(error?.response?.data || "Erro ao salvar o horário semanal.", { containerId: TOAST_CONTAINER_ID });
    } finally {
      setSaving(false);
    }
  };

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
          {loading && (
            <Container
              $width="100%"
              $height="60vh"
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
              <span className="loader" />
            </Container>
          )}
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
                Configuração Horários
              </Title>
              <Separator
                $width="calc(100% - 2rem)"
                $bordercolor="#e8e8e8"
                $margin="0.75rem 1rem 1.5rem 1rem"
                $style="solid"
              />
              <Form>
                {DAYS.map(({ dayOfWeek, label }) => {
                  const rule = rules.find((r) => r.dayOfWeek === dayOfWeek);
                  return (
                    <DayCard key={dayOfWeek}>
                      <DayHeader>
                        <DayTitle>{label}</DayTitle>
                        <ActiveSwitch
                          type="button"
                          $active={rule.active}
                          onClick={() => updateRule(dayOfWeek, { active: !rule.active })}
                        >
                          <SwitchThumb $active={rule.active} />
                        </ActiveSwitch>
                      </DayHeader>

                      {rule.active && (
                        <>
                          <FormGrid>
                            <div>
                              <Label>Abertura:</Label>
                              <Input
                                placeholder="08:00"
                                value={maskTime(rule.openTime)}
                                onChange={(e) => updateRule(dayOfWeek, { openTime: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label>Fechamento:</Label>
                              <Input
                                placeholder="18:00"
                                value={maskTime(rule.closeTime)}
                                onChange={(e) => updateRule(dayOfWeek, { closeTime: e.target.value })}
                              />
                            </div>
                          </FormGrid>

                          <IntervalRow>
                            <div>
                              <Label>Intervalo início:</Label>
                              <Input
                                placeholder="12:00"
                                value={maskTime(intervalDraft[dayOfWeek]?.start || "")}
                                onChange={(e) =>
                                  setIntervalDraft((prev) => ({
                                    ...prev,
                                    [dayOfWeek]: { ...prev[dayOfWeek], start: e.target.value }
                                  }))
                                }
                              />
                            </div>
                            <div>
                              <Label>Intervalo fim:</Label>
                              <Input
                                placeholder="13:00"
                                value={maskTime(intervalDraft[dayOfWeek]?.end || "")}
                                onChange={(e) =>
                                  setIntervalDraft((prev) => ({
                                    ...prev,
                                    [dayOfWeek]: { ...prev[dayOfWeek], end: e.target.value }
                                  }))
                                }
                              />
                            </div>
                            <AddIntervalButton type="button" onClick={() => addInterval(dayOfWeek)}>
                              <Plus size={14} />
                              Adicionar intervalo
                            </AddIntervalButton>
                          </IntervalRow>

                          {rule.intervals.length > 0 && (
                            <ChipContainer>
                              {rule.intervals.map((interval, index) => (
                                <Chip key={index}>
                                  <Clock size={12} />
                                  <span>{interval.startTime} - {interval.endTime}</span>
                                  <RemoveButton type="button" onClick={() => removeInterval(dayOfWeek, interval)}>
                                    <XIcon size={12} />
                                  </RemoveButton>
                                </Chip>
                              ))}
                            </ChipContainer>
                          )}
                        </>
                      )}
                    </DayCard>
                  );
                })}

                <Actions>
                  <SaveButton type="button" onClick={handleSave} disabled={saving}>
                    <Save size={16} />
                    {saving ? "Salvando..." : "Salvar horário semanal"}
                  </SaveButton>
                </Actions>
              </Form>
            </>
          )}
          <ToastContainer
            position={mobile ? "bottom-center" : "top-right"}
            autoClose={3000}
            style={mobile ? { margin: "0 5% 1rem 5%", width: "90%" } : undefined}
          />
        </Sidebar>
      </Container>
    </>
  );
}
