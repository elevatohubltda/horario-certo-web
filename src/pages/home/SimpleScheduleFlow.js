import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import Slider from "react-slick";
import { ReactComponent as ArrowLeft } from "../../assets/icons/arrow-left.svg?component";
import { ReactComponent as ArrowRight } from "../../assets/icons/arrow-right.svg?component";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Topbar from "../../components/topbar";
import { Container } from "../../components/container/style";
import { CustomFilterStyle } from "../../components/filter/style";
import DateRangeSelector from "../../components/dateRangeSelector";
import Dialog from "../../components/dialog";
import { Title } from "../../components/title";
import { Separator } from "../../components/separator/style";
import { Button } from "../../components/button";
import { ToastContainer, toast } from "react-toastify";
import { ThreeDots } from "react-loader-spinner";
import {
  DateHeader,
  DialogInput,
  Label
} from "../../components/scheduleDialogs/style";
import { getServicesPublic } from "../../services/endpoints/service";
import { getPublicProfessionals, getSimpleAvailability } from "../../services/endpoints/weeklyScheduleRule";
import { createReservedSchedule, removeReservedSchedule } from "../../services/endpoints/reservedSchedule";
import { formataNumeroTelefone, formatSchedulesToISO } from "../../util/format";
import { computeAvailableSlots } from "../../util/simpleSchedule";
import { getWeekDay } from "../../util/date";
import { RescheduleBanner, RescheduleConfirm } from "../../components/customer/Reschedule";

const ANY_PROFESSIONAL = "ANY";

const StepHeader = styled.div`
  padding: 0 1.5rem 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--ui-border);
`;

const StepTitle = styled.h2`
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--ui-text);
`;

const StepSubtitle = styled.p`
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
  color: var(--ui-muted);
`;

const LinkButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  color: var(--ui-text);
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
`;

const OptionList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 0.6rem;
  padding: 0 1.5rem;
`;

const OptionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%;
  padding: 0.85rem 1rem;
  background: #fff;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-sm);
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;

  > span {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  &:hover {
    border-color: var(--ui-primary);
    background: #f9fafb;
  }
`;

const OptionName = styled.span`
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--ui-text);
`;

const OptionMeta = styled.span`
  font-size: 0.8rem;
  color: var(--ui-muted);
`;

const OptionPrice = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--ui-text-secondary);
  white-space: nowrap;
`;

const sliderSettings = {
  dots: false,
  infinite: false,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  nextArrow: <button><ArrowRight/></button>,
  prevArrow: <button><ArrowLeft/></button>
};

// customer: cliente logado (preenche nome e WhatsApp); reschedule: agendamento sendo remarcado pela área do cliente
export default function SimpleScheduleFlow({ companyUrl, companyInfo, mobile, customer, reschedule }) {
  const [filter, setFilter] = useState({
    name: "3 dias",
    indexActive: 0,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split("T")[0]
  });
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  // Serviço escolhido; em "sem preferência" é um grupo { name, options } com o mesmo serviço de cada profissional
  const [selectedService, setSelectedService] = useState(null);
  // Disponibilidade por opção de agendamento (um item por profissional consultado)
  const [availabilityByOption, setAvailabilityByOption] = useState([]);
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  // Profissionais ativos; com mais de um, o cliente escolhe com quem (ou "sem preferência")
  const [professionals, setProfessionals] = useState([]);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const multiProfessional = professionals.length > 1;
  const anyProfessional = selectedProfessional === ANY_PROFESSIONAL;

  const [open, setOpen] = useState(false);
  const [available, setAvailable] = useState();
  const [code, setCode] = useState("");
  const [error, setError] = useState();
  const [selectedSchedule, setSelectedSchedule] = useState({
    data: "",
    horario: "",
    nome: "",
    telefone: ""
  });

  const fetchServices = async () => {
    setLoadingServices(true);
    try {
      const [servicesResponse, professionalsResponse] = await Promise.all([
        getServicesPublic(companyUrl),
        getPublicProfessionals(companyUrl).catch(() => ({ data: [] })),
      ]);
      setServices(servicesResponse.data || []);
      setProfessionals(professionalsResponse.data || []);
    } catch (error) {
      toast.error("Erro ao buscar os serviços da empresa.");
    } finally {
      setLoadingServices(false);
    }
  };

  // Profissionais que prestam o serviço escolhido, com o valor de cada um
  const serviceProfessionals = useMemo(
    () => (selectedService?.professionals || []).map((p) => ({ id: p.professionalId, name: p.professionalName, price: p.price })),
    [selectedService]
  );
  // Com um único profissional no serviço não há o que escolher
  const needsProfessionalChoice = multiProfessional && serviceProfessionals.length > 1;
  const readyToSchedule = !!selectedService && (!multiProfessional || !!selectedProfessional);

  const chooseService = (service) => {
    setSelectedService(service);
    setAvailabilityByOption([]);
    const options = service.professionals || [];
    setSelectedProfessional(
      multiProfessional && options.length === 1
        ? { id: options[0].professionalId, name: options[0].professionalName }
        : null
    );
  };

  const resetService = () => {
    setSelectedService(null);
    setSelectedProfessional(null);
    setAvailabilityByOption([]);
  };

  const resetProfessional = () => {
    setSelectedProfessional(null);
    setAvailabilityByOption([]);
  };

  const formatPrice = (value) =>
    Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // Valor exibido na escolha do serviço: único, ou "a partir de" quando varia por profissional
  const servicePriceLabel = (service) => {
    const prices = multiProfessional
      ? (service.professionals || []).map((p) => Number(p.price)).filter((p) => !Number.isNaN(p))
      : [Number(service.price)].filter((p) => !Number.isNaN(p));
    if (prices.length === 0) return null;
    const min = Math.min(...prices);
    return prices.some((p) => p !== min) ? `a partir de ${formatPrice(min)}` : formatPrice(min);
  };

  const cardProps = {
    $width: mobile ? "calc(100% - 2rem)" : "80%",
    $padding: "1.5rem 0",
    $backgroundcolor: "#fff",
    $borderRadius: "var(--ui-radius)",
    $border: "1px solid var(--ui-border)",
    $boxshadow: "var(--ui-card-shadow)"
  };

  // Opções de agendamento do serviço escolhido: uma por profissional que o presta (com o valor dele)
  const bookingOptions = useMemo(() => {
    if (!selectedService) return [];
    const base = { id: selectedService.id, durationMinutes: selectedService.durationMinutes };
    if (!multiProfessional) return [{ ...base, price: selectedService.price }];
    return (selectedService.professionals || [])
      .filter((p) => anyProfessional || p.professionalId === selectedProfessional?.id)
      .map((p) => ({ ...base, professionalId: p.professionalId, professionalName: p.professionalName, price: p.price }));
  }, [selectedService, multiProfessional, anyProfessional, selectedProfessional]);

  const fetchAvailability = async () => {
    setLoadingAvailability(true);
    try {
      const responses = await Promise.all(
        bookingOptions.map((option) =>
          getSimpleAvailability(
            companyUrl, filter.startDate, filter.endDate, false,
            multiProfessional ? option.professionalId : undefined
          )
        )
      );
      setAvailabilityByOption(responses.map((response) => response.data || []));
    } catch (error) {
      toast.error("Erro ao buscar os horários disponíveis.");
    } finally {
      setLoadingAvailability(false);
    }
  };

  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyUrl]);

  // Remarcação: já abre nos horários do mesmo serviço e do mesmo profissional
  useEffect(() => {
    if (!reschedule || loadingServices || selectedService) return;
    const service = services.find((s) => s.id === reschedule.serviceId);
    if (!service) return;
    setSelectedService(service);
    if (multiProfessional && reschedule.professionalId) {
      setSelectedProfessional({ id: reschedule.professionalId, name: reschedule.professionalName });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reschedule, loadingServices]);

  useEffect(() => {
    if (!readyToSchedule) return;
    fetchAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, selectedService, selectedProfessional]);

  const handleFilter = (name, index, startDate, endDate) => {
    switch (name) {
      case "3 dias":
        setFilter({
          name,
          indexActive: index,
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split("T")[0]
        });
        break;
      case "7 dias":
        setFilter({
          name,
          indexActive: index,
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date(new Date().setDate(new Date().getDate() + 6)).toISOString().split("T")[0]
        });
        break;
      default:
        if (!startDate || !endDate) {
          toast.error("É necessário selecionar uma data de início e uma data de fim para esse filtro.");
          return;
        }
        setFilter({
          name,
          indexActive: index,
          startDate: new Date(startDate).toISOString().split("T")[0],
          endDate: new Date(endDate).toISOString().split("T")[0]
        });
        break;
    }
  };

  const formatDatePtBr = (isoDate) => {
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
  };

  const itsAvailableNow = (data, horario) => {
    const now = new Date().toLocaleString("sv-SE", {
      timeZone: "America/Sao_Paulo",
      hour12: false
    }).replace(" ", "T");

    const [day, month, year] = data.split("/");
    const [hour, minute] = horario.split(":");

    const isoLike = `${year}-${month}-${day}T${hour}:${minute}:00`;
    return isoLike <= now;
  };

  // Junta os horários de todas as opções: um horário está livre se algum profissional estiver livre,
  // e guarda qual opção (profissional + serviço dele) será usada ao agendar
  const daysWithSlots = useMemo(() => {
    if (!selectedService || availabilityByOption.length === 0) return [];
    const baseDays = availabilityByOption[0] || [];
    return baseDays.map((baseDay, dayIndex) => {
      const data = formatDatePtBr(baseDay.date);
      const merged = new Map();
      bookingOptions.forEach((option, optionIndex) => {
        const day = availabilityByOption[optionIndex]?.[dayIndex];
        if (!day) return;
        computeAvailableSlots({
          openTime: day.openTime,
          closeTime: day.closeTime,
          intervals: day.intervals,
          bookedSlots: day.bookedSlots,
          durationMinutes: option.durationMinutes
        }).forEach((slot) => {
          const current = merged.get(slot.horario);
          if (!current || (!current.available && slot.available)) {
            merged.set(slot.horario, { horario: slot.horario, available: slot.available, option });
          }
        });
      });
      return {
        data,
        slots: [...merged.values()]
          .sort((a, b) => a.horario.localeCompare(b.horario))
          .filter((slot) => !itsAvailableNow(data, slot.horario))
      };
    });
  }, [availabilityByOption, bookingOptions, selectedService]);

  const handleRestartProps = () => {
    setSelectedSchedule({ data: "", horario: "", nome: "", telefone: "" });
    setAvailable();
    setCode("");
    setError();
  };

  const selectSchedule = (data, horario, isAvailable, option) => {
    if (reschedule) {
      if (isAvailable) setRescheduleTarget({ data, horario });
      return;
    }
    setAvailable(isAvailable);
    setSelectedOption(option || null);
    setSelectedSchedule({
      data,
      horario,
      nome: isAvailable && customer ? customer.name : "",
      telefone: isAvailable && customer ? formataNumeroTelefone(customer.telephone || "") : ""
    });
    setCode("");
    setOpen(true);
  };

  const makeSchedule = async () => {
    if (selectedSchedule.telefone.replace(/\D/g, "").length < 11) {
      toast.error("Telefone inválido!");
      return;
    }
    const scheduleISOFormat = formatSchedulesToISO({ date: selectedSchedule.data, schedules: [selectedSchedule.horario] });
    const option = selectedOption || bookingOptions[0];
    const reservedSchedule = {
      name: selectedSchedule.nome,
      telephone: selectedSchedule.telefone.replace(/\D/g, ""),
      schedule: scheduleISOFormat[0],
      service: option.id,
      ...(multiProfessional ? { professionalId: option.professionalId } : {})
    };
    try {
      const response = await createReservedSchedule(companyUrl, reservedSchedule);
      setCode(response.data);
    } catch (error) {
      if (error?.response?.status === 409) {
        toast.error(error.response.data || "Esse horário já está ocupado. Escolha outro horário.");
        setOpen(false);
        handleRestartProps();
      } else {
        toast.error("Erro ao criar agendamento.");
      }
      fetchAvailability();
    }
  };

  const makeCancelSchedule = async () => {
    if (selectedSchedule.telefone.replace(/\D/g, "").length < 11 || code.length === 0) {
      toast.error("Telefone/código de cancelamento devem ser preenchidos corretamente!");
      return;
    }
    const scheduleISOFormat = formatSchedulesToISO({ date: selectedSchedule.data, schedules: [selectedSchedule.horario] });
    const reservedSchedule = {
      telephone: selectedSchedule.telefone.replace(/\D/g, ""),
      schedule: scheduleISOFormat[0],
      cancelCode: code
    };
    try {
      await removeReservedSchedule(companyUrl, reservedSchedule);
      toast.success("Agendamento cancelado com sucesso!");
      fetchAvailability();
      handleRestartProps();
      setOpen(false);
    } catch (error) {
      setError(error.response?.data || "Não foi possível cancelar o agendamento.");
    }
  };

  const isScheduleFormInvalid = !selectedSchedule.nome || !selectedSchedule.telefone;

  return (
    <div style={{ backgroundColor: "var(--ui-page-bg)", minHeight: "100dvh", paddingBottom: "2rem", overflowX: "hidden" }}>
      <Topbar
        name={companyInfo.name}
        imagem={companyInfo.imagem}
        whatsapp={companyInfo.whatsapp}
        instagram={companyInfo.instagram}
      />

      {reschedule && <RescheduleBanner appointment={reschedule} width={mobile ? "calc(100% - 2rem)" : "80%"} />}

      {/* PASSO 1: SERVIÇO */}
      {!selectedService && (
        <Container {...cardProps}>
          <StepHeader>
            <StepTitle>Escolha o serviço</StepTitle>
            <StepSubtitle>Selecione o que você quer agendar.</StepSubtitle>
          </StepHeader>
          {loadingServices && (
            <div className="loading-slide">
              <ThreeDots color="#1E2240" height={20} width={60} />
              <p>Buscando serviços...</p>
            </div>
          )}
          {!loadingServices && services.length === 0 && (
            <div className="slide no-schedules">
              <h3>Nenhum serviço cadastrado</h3>
              <p>Essa empresa ainda não cadastrou serviços.</p>
            </div>
          )}
          {!loadingServices && services.length > 0 && (
            <OptionList>
              {services.map((service) => {
                const price = servicePriceLabel(service);
                return (
                  <OptionButton key={service.id} type="button" onClick={() => chooseService(service)}>
                    <span>
                      <OptionName>{service.name}</OptionName>
                      <OptionMeta>{service.durationMinutes} min</OptionMeta>
                    </span>
                    {price && <OptionPrice>{price}</OptionPrice>}
                  </OptionButton>
                );
              })}
            </OptionList>
          )}
        </Container>
      )}

      {/* PASSO 2: PROFISSIONAL (só os que prestam o serviço escolhido) */}
      {selectedService && multiProfessional && !selectedProfessional && (
        <Container {...cardProps}>
          <StepHeader>
            <StepTitle>Escolha o profissional</StepTitle>
            <StepSubtitle>
              {selectedService.name} · {selectedService.durationMinutes} min ·{" "}
              <LinkButton type="button" onClick={resetService}>trocar serviço</LinkButton>
            </StepSubtitle>
          </StepHeader>
          {serviceProfessionals.length === 0 ? (
            <div className="slide no-schedules">
              <h3>Nenhum profissional disponível</h3>
              <p>Esse serviço ainda não tem profissionais vinculados.</p>
            </div>
          ) : (
            <OptionList>
              {serviceProfessionals.map((professional) => (
                <OptionButton
                  key={professional.id}
                  type="button"
                  onClick={() => setSelectedProfessional({ id: professional.id, name: professional.name })}
                >
                  <OptionName>{professional.name}</OptionName>
                  {professional.price != null && <OptionPrice>{formatPrice(professional.price)}</OptionPrice>}
                </OptionButton>
              ))}
              <OptionButton type="button" onClick={() => setSelectedProfessional(ANY_PROFESSIONAL)}>
                <span>
                  <OptionName>Sem preferência</OptionName>
                  <OptionMeta>Primeiro profissional disponível no horário</OptionMeta>
                </span>
              </OptionButton>
            </OptionList>
          )}
        </Container>
      )}

      {/* PASSO 3: HORÁRIO */}
      {readyToSchedule && (
        <>
          <CustomFilterStyle $width={mobile ? "calc(100% - 2rem)" : "80%"}>
            <span style={{ fontSize: "0.85rem", color: "var(--ui-text-secondary)" }}>
              Serviço: <strong>{selectedService.name}</strong>
              {multiProfessional && (
                <> · {anyProfessional ? "Sem preferência" : selectedProfessional.name}</>
              )}
            </span>
            {!reschedule && (
              <button className="filter-button" onClick={resetService}>
                Trocar serviço
              </button>
            )}
            {needsProfessionalChoice && !reschedule && (
              <button className="filter-button" onClick={resetProfessional}>
                Trocar profissional
              </button>
            )}
            <button className={filter.indexActive === 0 ? "active filter-button" : "filter-button"} onClick={() => handleFilter("3 dias", 0)}>
              3 dias
            </button>
            <button className={filter.indexActive === 1 ? "active filter-button" : "filter-button"} onClick={() => handleFilter("7 dias", 1)}>
              7 dias
            </button>
            <DateRangeSelector
              isActive={filter.indexActive === 2}
              onChangeRange={({ startDate, endDate }) => {
                handleFilter("personalizado", 2, startDate, endDate);
              }}
            />
          </CustomFilterStyle>

          <Container {...cardProps} $padding="0 0 1.5em 0">
            <Slider {...sliderSettings}>
              {!loadingAvailability && daysWithSlots.some((day) => day.slots.length > 0) &&
                daysWithSlots.map(
                  (day, index) =>
                    day.slots.length > 0 && (
                      <div key={index} className="slide">
                        <DateHeader>
                          <div>
                            <h3 style={{ margin: 0 }}>{day.data}</h3>
                            <span>{"(" + getWeekDay(day.data) + ")"}</span>
                          </div>
                        </DateHeader>
                        <div className="horarios-container">
                          {day.slots.map((slot, i) => (
                            <button
                              key={i}
                              className={slot.available ? "horario-btn" : "horario-btn horario-btn-unavailable"}
                              onClick={() => selectSchedule(day.data, slot.horario, slot.available, slot.option)}
                            >
                              {slot.horario}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                )}
              {!loadingAvailability && daysWithSlots.every((day) => day.slots.length === 0) && (
                <div className="slide no-schedules">
                  <h3>Nenhum horário disponível</h3>
                  <p>Verifique novamente mais tarde.</p>
                </div>
              )}
              {loadingAvailability && (
                <div className="loading-slide">
                  <ThreeDots color="#1E2240" height={20} width={60} />
                  <p>Buscando horários...</p>
                </div>
              )}
            </Slider>
          </Container>
        </>
      )}

      {/* CONFIRMAÇÃO DE AGENDAMENTO */}
      <Dialog open={open && available && !code} onClose={() => { setOpen(false); handleRestartProps(); }}>
        <Title $fontweight="700" $fontsize="1.2rem">
          Confirme seu agendamento
        </Title>
        <Separator $width="100%" $margin="0.75rem 0 1.25rem 0" />
        <form style={{ backgroundColor: "transparent", boxShadow: "none", width: "100%", padding: "0" }}>
          <Label>Data:</Label>
          <DialogInput value={selectedSchedule.data} readOnly />
          <Label>Horário:</Label>
          <DialogInput value={selectedSchedule.horario} readOnly />
          <Label>Serviço:</Label>
          <DialogInput value={selectedService?.name || ""} readOnly />
          {multiProfessional && selectedOption?.professionalName && (
            <>
              <Label>Profissional:</Label>
              <DialogInput value={selectedOption.professionalName} readOnly />
            </>
          )}
          {selectedOption?.price != null && (
            <>
              <Label>Valor:</Label>
              <DialogInput
                value={Number(selectedOption.price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                readOnly
              />
            </>
          )}
          <Label>Digite seu nome:</Label>
          <DialogInput
            type="text"
            value={selectedSchedule.nome}
            onChange={(e) => setSelectedSchedule({ ...selectedSchedule, nome: e.target.value })}
          />
          <Label>Digite seu telefone com DDD:</Label>
          <DialogInput
            type="text"
            value={formataNumeroTelefone(selectedSchedule.telefone || "")}
            onChange={(e) => setSelectedSchedule({ ...selectedSchedule, telefone: formataNumeroTelefone(e.target.value) })}
          />
          <Container $width="auto" $display="flex" $alignitems="flex-end" $justifycontent="space-between" $margin="0" $backgroundcolor="transparent" $boxshadow="none">
            <Button variant="link" type="button" onClick={() => { setOpen(false); fetchAvailability(); handleRestartProps(); }}>
              Voltar
            </Button>
            <Button type="button" variant={isScheduleFormInvalid ? "disabled" : "confirm"} onClick={makeSchedule}>
              Agendar
            </Button>
          </Container>
        </form>
      </Dialog>

      {/* CÓDIGO DE CANCELAMENTO */}
      <Dialog open={open && available && code} onClose={() => { setOpen(false); fetchAvailability(); handleRestartProps(); }}>
        <Title $fontweight="700" $fontsize="1.2rem">
          Agendamento confirmado!
        </Title>
        <Separator $width="100%" $margin="0.75rem 0 1.25rem 0" />
        <form style={{ backgroundColor: "transparent", boxShadow: "none", width: "100%", padding: "0", textAlign: "center" }}>
          <span>Guarde o código abaixo para desmarcar:</span>
          <h3 style={{ margin: "2rem 0" }}>{code}</h3>
          <span style={{ fontSize: "12px", color: "#535353" }}>*recomendamos tirar print da tela</span>
          <Container $width="auto" $display="flex" $alignitems="center" $justifycontent="center" $margin="2rem 0 0 0" $backgroundcolor="transparent" $boxshadow="none">
            <Button variant="confirm" type="button" onClick={() => { setOpen(false); fetchAvailability(); handleRestartProps(); }}>
              OK
            </Button>
          </Container>
        </form>
      </Dialog>

      {/* CANCELAMENTO */}
      <Dialog open={open && !available && !error} onClose={() => { setOpen(false); handleRestartProps(); }}>
        <Title $fontweight="700" $fontsize="1.2rem">
          Cancele seu agendamento
        </Title>
        <Separator $width="100%" $margin="0.75rem 0 1.25rem 0" />
        <form style={{ backgroundColor: "transparent", boxShadow: "none", width: "100%", padding: "0" }}>
          <Label>Data:</Label>
          <DialogInput type="text" value={selectedSchedule.data} readOnly />
          <Label>Horário:</Label>
          <DialogInput type="text" value={selectedSchedule.horario} readOnly />
          <Label>Digite seu telefone com DDD:</Label>
          <DialogInput
            type="text"
            value={formataNumeroTelefone(selectedSchedule.telefone || "")}
            onChange={(e) => setSelectedSchedule({ ...selectedSchedule, telefone: formataNumeroTelefone(e.target.value) })}
          />
          <Label>Digite seu código de cancelamento:</Label>
          <DialogInput type="text" value={code} onChange={(e) => setCode(e.target.value)} />
          <Separator $width="100%" $margin="0.5rem 0 1rem 0" />
          <Container $width="auto" $display="flex" $alignitems="flex-end" $justifycontent="space-between" $margin="0" $backgroundcolor="transparent" $boxshadow="none">
            <Button variant="link" type="button" onClick={() => { setOpen(false); handleRestartProps(); }}>
              Voltar
            </Button>
            <Button type="button" variant={!code || !selectedSchedule.telefone ? "disabled" : "confirm"} onClick={makeCancelSchedule}>
              Cancelar
            </Button>
          </Container>
        </form>
      </Dialog>

      {/* CANCELAMENTO NÃO POSSÍVEL */}
      <Dialog open={open && !available && error} onClose={() => { setOpen(false); handleRestartProps(); }}>
        <Title $fontweight="700" $fontsize="1.2rem">
          Não foi possível cancelar seu agendamento
        </Title>
        <Separator $width="100%" $margin="0.75rem 0 1.25rem 0" />
        <form style={{ backgroundColor: "transparent", boxShadow: "none", width: "100%", padding: "0" }}>
          <span>{error}</span>
          <Container $width="auto" $display="flex" $alignitems="flex-end" $justifycontent="space-between" $margin="2rem 0 0 0" $backgroundcolor="transparent" $boxshadow="none">
            <Button
              variant="link"
              onClick={() => { setOpen(false); handleRestartProps(); }}
            >
              Voltar
            </Button>
          </Container>
        </form>
      </Dialog>

      {reschedule && (
        <RescheduleConfirm
          appointment={reschedule}
          target={rescheduleTarget}
          onClose={() => { setRescheduleTarget(null); fetchAvailability(); }}
        />
      )}

      <ToastContainer
        position={mobile ? "bottom-center" : "top-right"}
        autoClose={3000}
        style={mobile ? { margin: "0 5% 1rem 5%", width: "90%" } : undefined}
      />
    </div>
  );
}
