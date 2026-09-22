import React, { useEffect, useMemo, useState } from "react";
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
import { getSimpleAvailability } from "../../services/endpoints/weeklyScheduleRule";
import { createReservedSchedule, removeReservedSchedule } from "../../services/endpoints/reservedSchedule";
import { formataNumeroTelefone, formatSchedulesToISO } from "../../util/format";
import { computeAvailableSlots } from "../../util/simpleSchedule";
import { getWeekDay } from "../../util/date";

const sliderSettings = {
  dots: false,
  infinite: false,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  nextArrow: <button><ArrowRight/></button>,
  prevArrow: <button><ArrowLeft/></button>
};

export default function SimpleScheduleFlow({ companyUrl, companyInfo, mobile }) {
  const [filter, setFilter] = useState({
    name: "3 dias",
    indexActive: 0,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split("T")[0]
  });
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [availabilityDays, setAvailabilityDays] = useState([]);
  const [loadingAvailability, setLoadingAvailability] = useState(true);

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
      const response = await getServicesPublic(companyUrl);
      setServices(response.data || []);
    } catch (error) {
      toast.error("Erro ao buscar os serviços da empresa.");
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchAvailability = async () => {
    setLoadingAvailability(true);
    try {
      const response = await getSimpleAvailability(companyUrl, filter.startDate, filter.endDate);
      setAvailabilityDays(response.data || []);
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

  useEffect(() => {
    if (!selectedService) return;
    fetchAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, selectedService]);

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

  const daysWithSlots = useMemo(() => {
    if (!selectedService) return [];
    return availabilityDays.map((day) => {
      const data = formatDatePtBr(day.date);
      return {
        data,
        slots: computeAvailableSlots({
          openTime: day.openTime,
          closeTime: day.closeTime,
          intervals: day.intervals,
          bookedSlots: day.bookedSlots,
          durationMinutes: selectedService.durationMinutes
        }).filter((slot) => !itsAvailableNow(data, slot.horario))
      };
    });
  }, [availabilityDays, selectedService]);

  const handleRestartProps = () => {
    setSelectedSchedule({ data: "", horario: "", nome: "", telefone: "" });
    setAvailable();
    setCode("");
    setError();
  };

  const selectSchedule = (data, horario, isAvailable) => {
    setAvailable(isAvailable);
    setSelectedSchedule({ data, horario, nome: "", telefone: "" });
    setCode("");
    setOpen(true);
  };

  const makeSchedule = async () => {
    if (selectedSchedule.telefone.replace(/\D/g, "").length < 11) {
      toast.error("Telefone inválido!");
      return;
    }
    const scheduleISOFormat = formatSchedulesToISO({ date: selectedSchedule.data, schedules: [selectedSchedule.horario] });
    const reservedSchedule = {
      name: selectedSchedule.nome,
      telephone: selectedSchedule.telefone.replace(/\D/g, ""),
      schedule: scheduleISOFormat[0],
      service: selectedService.id
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
    <div style={{ backgroundColor: "var(--color-background)", height: "100dvh" }}>
      <Topbar
        name={companyInfo.name}
        imagem={companyInfo.imagem}
        whatsapp={companyInfo.whatsapp}
        instagram={companyInfo.instagram}
      />

      {!selectedService && (
        <Container $width="80%" $padding="1.5rem 0" $backgroundcolor="#fff" $borderRadius="1rem">
          <Title $fontweight="600" $fontsize="1.2rem" $color="var(--color-brown)" $padding="0 1.5rem">
            Escolha o serviço
          </Title>
          <Separator $width="calc(100% - 3rem)" $bordercolor="#e8e8e8" $margin="0.75rem 1.5rem 1.5rem 1.5rem" $style="solid" />
          {loadingServices && (
            <div className="loading-slide">
              <ThreeDots color="var(--color-sage)" height={20} width={60} />
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
            <div className="horarios-container" style={{ padding: "0 1.5rem" }}>
              {services.map((service) => (
                <button
                  key={service.id}
                  className="horario-btn"
                  onClick={() => setSelectedService(service)}
                >
                  {service.name} ({service.durationMinutes} min)
                </button>
              ))}
            </div>
          )}
        </Container>
      )}

      {selectedService && (
        <>
          <CustomFilterStyle $width="80%">
            <span style={{ fontSize: "0.85rem", color: "var(--color-olive)" }}>
              Serviço: <strong>{selectedService.name}</strong>
            </span>
            <button className="filter-button" onClick={() => setSelectedService(null)}>
              Trocar serviço
            </button>
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

          <Container $width="80%" $padding="0 0 1.5em 0" $backgroundcolor="#fff" $borderRadius="1rem">
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
                              onClick={() => selectSchedule(day.data, slot.horario, slot.available)}
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
                  <ThreeDots color="var(--color-sage)" height={20} width={60} />
                  <p>Buscando horários...</p>
                </div>
              )}
            </Slider>
          </Container>
        </>
      )}

      {/* CONFIRMAÇÃO DE AGENDAMENTO */}
      <Dialog open={open && available && !code} onClose={() => { setOpen(false); handleRestartProps(); }}>
        <Title $fontweight="600" $fontsize="1.1rem" $color="var(--color-brown)" $texttransform="uppercase">
          Confirme seu agendamento
        </Title>
        <Separator $width="100%" $bordercolor="var(--color-olive)" $margin="0.75rem 0 2rem 0" $style="dotted" />
        <form style={{ backgroundColor: "transparent", boxShadow: "none", width: "100%", padding: "0" }}>
          <Label>Data:</Label>
          <DialogInput value={selectedSchedule.data} readOnly />
          <Label>Horário:</Label>
          <DialogInput value={selectedSchedule.horario} readOnly />
          <Label>Serviço:</Label>
          <DialogInput value={selectedService?.name || ""} readOnly />
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
        <Title $fontweight="600" $fontsize="1.1rem" $color="var(--color-brown)" $texttransform="uppercase">
          Agendamento confirmado!
        </Title>
        <Separator $width="100%" $bordercolor="#ccc" $margin="1rem 0 3rem 0" $style="dotted" />
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
        <Title $fontweight="600" $fontsize="1.1rem" $color="var(--color-brown)" $texttransform="uppercase">
          Cancele seu agendamento
        </Title>
        <Separator $width="100%" $bordercolor="var(--color-dark)" $margin="1rem 0 3rem 0" $style="dotted" />
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
          <Separator $width="100%" $bordercolor="#ccc" $style="dotted" />
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
        <Title $fontweight="600" $fontsize="1.1rem" $color="var(--color-brown)" $texttransform="uppercase">
          Não foi possível cancelar seu agendamento
        </Title>
        <Separator $width="100%" $bordercolor="#ccc" $margin="1rem 0 3rem 0" $style="dotted" />
        <form style={{ backgroundColor: "transparent", boxShadow: "none", width: "100%", padding: "0" }}>
          <span>{error}</span>
          <Container $width="auto" $display="flex" $alignitems="flex-end" $justifycontent="space-between" $margin="2rem 0 0 0" $backgroundcolor="transparent" $boxshadow="none">
            <Button
              style={{ fontSize: "0.8rem", padding: "0.5rem 1rem", backgroundColor: "transparent", borderColor: "transparent", color: "#000000" }}
              onClick={() => { setOpen(false); handleRestartProps(); }}
            >
              Voltar
            </Button>
          </Container>
        </form>
      </Dialog>

      <ToastContainer
        position={mobile ? "bottom-center" : "top-right"}
        autoClose={3000}
        style={mobile ? { margin: "0 5% 1rem 5%", width: "90%" } : undefined}
      />
    </div>
  );
}
