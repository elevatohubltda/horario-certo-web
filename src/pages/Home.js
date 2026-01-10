import React, { useEffect } from "react";
import Slider from "react-slick";
import { ReactComponent as ArrowLeft } from '../assets/icons/arrow-left.svg?component';
import { ReactComponent as ArrowRight } from '../assets/icons/arrow-right.svg?component';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import "../styles/index.css";
import { getWeekDay } from "../util/date";
import Topbar from "../components/topbar";
import { Container } from "../components/container/style";
import { CustomFilterStyle } from "../components/filter/style";
import { useParams } from "react-router-dom";
import { getCompany, getCompanySchedules } from "../services/endpoints/company";
import { formataNumeroTelefone, formatSchedulesToISO, transformarHorariosPorData } from "../util/format";
import { ThreeDots } from "react-loader-spinner";
import DateRangeSelector from "../components/dateRangeSelector";
import Dialog from "../components/dialog";
import { Title } from "../components/title";
import { Separator } from "../components/separator/style";
import { createReservedSchedule, removeReservedSchedule } from "../services/endpoints/reservedSchedule";
import { ToastContainer, toast } from "react-toastify";
import { isMobile, openWhatsApp } from "../util/util";
import { WhatsApp } from '@mui/icons-material';
import FilterDropdown from "../components/filterDropdown";
import styled from "styled-components";
import { Button } from "../components/button";

export default function Home() {
  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <button><ArrowRight/></button>,
    prevArrow: <button><ArrowLeft/></button>
  };
  const [filter, setFilter] = React.useState({
    name: "3 dias",
    indexActive: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0],
  });
  const { companyUrl } = useParams();
  const [mobile, setMobile] = React.useState();
  const [loading, setLoading] = React.useState(true);
  const [loadingSchedule, setLoadingSchedule] = React.useState(true);
  const [companyInfo, setCompanyInfo] = React.useState();
  const [horarios, setHorarios] = React.useState([]);
  const [filtered, setFiltered] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [selectedSchedule, setSelectedSchedule] = React.useState(
    {
      data: "",
      horario: "",
      nome: undefined,
      telefone: undefined
    }
  );
  const [available, setAvailable] = React.useState()
  const [code, setCode] = React.useState()
  const [error, setError] = React.useState()
  const filters = [
    { label: "Remover filtro", value: "", color: "" },
    { label: "Disponível", value: "available", color: "#4caf50" }
  ];

  const handleFilter = (name, index, startDate, endDate) => {
    switch (name) {
      case "3 dias":
        setFilter({
          name: name,
          indexActive: index,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0],
        });
        break;
      case "7 dias":
        setFilter({
          name: name,
          indexActive: index,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(new Date().setDate(new Date().getDate() + 6)).toISOString().split('T')[0],
        });
        break;
      default:
        if (!startDate || !endDate) {
          toast.error("É necessário selecionar uma data de início e uma data de fim para esse filtro.");
          return;
        }
        setFilter({
          name: name,
          indexActive: index,
          startDate: new Date(startDate).toISOString().split('T')[0],
          endDate: new Date(endDate).toISOString().split('T')[0],
        });
        break;
    }
  };
  
  const getCompanyInfo = async () => {
    setLoading(true);
    try {
      const response = await getCompany(companyUrl);
      setCompanyInfo(response.data);
      setLoading(false);
    } catch (error) {
      toast.error("Erro ao buscar os dados da empresa:", error);
      setLoading(false);
    }
  }

  const handleCompanySchedules = async () => {
    setLoadingSchedule(true);
    try { 
      const response = await getCompanySchedules(companyUrl, filter.startDate, filter.endDate);
      setHorarios(transformarHorariosPorData(response.data));
      setLoadingSchedule(false);
    } catch (error) {
      toast.error("Erro ao buscar os horários da empresa:", error);
      setLoadingSchedule(false);
    }
  }

  const selectSchedule = (data, horario, available, nome) => {
    setAvailable(available);
    setSelectedSchedule({ data, horario, nome});
    setCode('');
    setOpen(true);
  }

  const makeSchedule = async () => {
    if(selectedSchedule.telefone.replace(/\D/g, '').length < 11){
      toast.error("Telefone inválido!");
      handleCompanySchedules(); 
      handleRestartProps();
      setOpen(false);
      return;
    }
    const scheduleISOFormat = formatSchedulesToISO({date: selectedSchedule.data, schedules: [selectedSchedule.horario]});
    const reservedSchedule = {
      name: selectedSchedule.nome,
      telephone: selectedSchedule.telefone.replace(/\D/g, ''),
      schedule: scheduleISOFormat[0]
    }
    try {
      const response = await createReservedSchedule(companyUrl, reservedSchedule);
      setCode(response.data);
    } catch (error) {
      handleCompanySchedules();
      toast.error("Erro ao criar agendamento:", error);
    }
  }

  const makeCancelSchedule = async () => {
    if(selectedSchedule.telefone.replace(/\D/g, '').length < 11 || code.length === 0){
      toast.error("Telefone/código de cancelamento devem ser preenchidos corretamente!");
      handleCompanySchedules(); 
      handleRestartProps();
      setOpen(false);
      return;
    }
    const scheduleISOFormat = formatSchedulesToISO({date: selectedSchedule.data, schedules: [selectedSchedule.horario]});
    const reservedSchedule = {
      telephone: selectedSchedule.telefone.replace(/\D/g, ''),
      schedule: scheduleISOFormat[0],
      cancelCode: code
    }
    try {
      await removeReservedSchedule(companyUrl, reservedSchedule);
      toast.success("Agendamento cancelado com sucesso!");
      handleCompanySchedules();
      handleRestartProps();
      setOpen(false);
    } catch (error) {
      if(error.status === 422){
        setError(error.response.data);
      } else if(error.status === 400){
        setError(error.response.data);
      } else{
        toast.error("Erro ao cancelar agendamento:", error);
      }
    }
  }

  const handleRestartProps = () => {
    setSelectedSchedule(
      {
        data: "",
        horario: "",
        nome: "",
        telefone: ""
      }
    )
    setAvailable();
    setCode('')
    setError();
  }

  const itsAvailableNow = (date, time) => {
    const now = new Date().toLocaleString('sv-SE', 
      {
        timeZone: 'America/Sao_Paulo',
        hour12: false
      }
    ).replace(' ', 'T');

    const [day, month, year] = date.split("/");
    const [hour, minute] = time.split(":");

    const isoLike = `${year}-${month}-${day}T${hour}:${minute}:00`;
    return isoLike <= now;
  }

  const itsAvailableDayByArray = (value) => {
    const filtered = value.horarios.filter(iteminside =>
      iteminside.available === true &&
      !itsAvailableNow(value.data, iteminside.horario)
    );

    return filtered.length > 0;
  }

  const filterSchedulesByDropdown = (value) => {
    switch (value) {
      case "available": {
        const filtered = horarios
          .map(item => {
            const horariosFiltrados = item.horarios.filter(iteminside =>
              iteminside.available === true &&
              !itsAvailableNow(item.data, iteminside.horario)
            );

            return {
              ...item,
              horarios: horariosFiltrados
            };
          })
          .filter(item => item.horarios.length > 0);

        setFiltered(filtered);
        break;
      }
      default:
        setFiltered(horarios);
        break;
    }
  };

  useEffect(() => {
    handleCompanySchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
    getCompanyInfo();
    setMobile(isMobile());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyUrl]);

  return (
    <>
      {companyInfo && 
        <div style={{backgroundColor: 'var(--color-background)', height: '100dvh'}}>
          <Topbar 
            name={companyInfo.name} 
            imagem={companyInfo.imagem}
            whatsapp={companyInfo.whatsapp} 
            instagram={companyInfo.instagram}
          />
          <CustomFilterStyle $width="80%">
            <FilterDropdown
              filters={filters}
              onChange={(value) => {
                filterSchedulesByDropdown(value);
              }}
            />
            <button className={filter.indexActive === 0 ? 'active filter-button' : 'filter-button'} onClick={() => handleFilter("3 dias", 0)}>
              3 dias
            </button>
            <button className={filter.indexActive === 1 ? 'active filter-button' : 'filter-button'} onClick={() => handleFilter("7 dias", 1)}>
              7 dias
            </button>
            <DateRangeSelector
              isActive={filter.indexActive === 2}
              onChangeRange={({ startDate, endDate }) => {
                handleFilter("personalizado", 2, startDate, endDate);
              }}
            />
          </CustomFilterStyle>
          <Container
            $width="80%"
            $padding="0 0 1.5em 0"
            $backgroundcolor="#fff"
            $borderradius="1rem"
          >
            <Slider {...settings}>
              {!loadingSchedule && horarios.length > 0 && filtered.length > 0 ? 
              filtered.map((item, index) => (
                itsAvailableDayByArray(item) && (
                  <div key={index} className="slide">
                    <h3>{item.data}</h3>
                    <span>{"("+getWeekDay(item.data)+")"}</span>
                    <div className="horarios-container">
                      {item.horarios.map((iteminside, i) =>
                        !itsAvailableNow(item.data, iteminside.horario) ? (
                          <button
                            key={i}
                            className={
                              iteminside.available === false
                                ? 'horario-btn horario-btn-unavailable'
                                : 'horario-btn'
                            }
                            onClick={() =>
                              selectSchedule(
                                item.data,
                                iteminside.horario,
                                iteminside.available,
                                iteminside.name
                              )
                            }
                          >
                            {iteminside.horario}
                          </button>
                        ) : null
                      )}
                    </div>
                  </div>
                )
              )) : 
              horarios.map((item, index) => (
                itsAvailableDayByArray(item) && (
                  <div key={index} className="slide">
                    <h3>{item.data}</h3>
                    <span>{"("+getWeekDay(item.data)+")"}</span>
                    <div className="horarios-container">
                      {item.horarios.map((iteminside, i) =>
                        !itsAvailableNow(item.data, iteminside.horario) ? (
                          <button
                            key={i}
                            className={
                              iteminside.available === false
                                ? 'horario-btn horario-btn-unavailable'
                                : 'horario-btn'
                            }
                            onClick={() =>
                              selectSchedule(
                                item.data,
                                iteminside.horario,
                                iteminside.available,
                                iteminside.name
                              )
                            }
                          >
                            {iteminside.horario}
                          </button>
                        ) : null
                      )}
                    </div>
                  </div>
                )
              ))
            }
              {!loadingSchedule && horarios.length === 0 && 
                <div className="slide no-schedules">
                  <h3>Nenhum horário disponível</h3>
                  <p>Verifique novamente mais tarde.</p>
                </div>
              }
              {loadingSchedule &&
                <div className="loading-slide">
                  <ThreeDots color="var(--color-sage)" height={20} width={60} />
                  <p>Buscando horários...</p>
                </div>
              }
            </Slider>
          </Container>
        </div>
      }
      {/* PREENCHIMENTO DADOS DO AGENDAMENTO */}
      <Dialog open={open && available && !code} onClose={() => {setOpen(false); handleRestartProps()}}>
        <Title
          $fontweight="600"
          $fontsize="1.1rem"
          $color="var(--color-brown)"
          $texttransform="uppercase"
        >
          Confirme seu agendamento
        </Title>
        <Separator 
          $width="100%"
          $bordercolor="var(--color-olive)"
          $margin="0.75rem 0 2rem 0" 
        />
        <form style={{ backgroundColor: "transparent", boxShadow: "none", width: "100%", padding: "0" }}>
          <Label>Data:</Label>
          <DialogInput value={selectedSchedule.data} readOnly />
          <Label>Horário:</Label>
          <DialogInput value={selectedSchedule.horario} readOnly />
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
            onChange={(e) => setSelectedSchedule({ ...selectedSchedule, telefone: formataNumeroTelefone(e.target.value) }) }
          />
          <Container
              $width="auto"
              $display="flex"
              $alignitems="flex-end"
              $justifycontent="space-between"
              $margin="0"
              $backgroundcolor="transparent"
          >
            <Button
              variant="link"
              type="button"
              onClick={() => {setOpen(false); handleCompanySchedules(); handleRestartProps()}}
            >
                Voltar
            </Button>
            <Button
              type="button"
              variant={!selectedSchedule.nome || !selectedSchedule.telefone ? "disabled" : "confirm"}
              onClick={makeSchedule}
            >
                Agendar
            </Button>
          </Container>
        </form>
      </Dialog>
      {/* CONFIRMAÇÃO AGENDAMENTO + CODIGO CANCELAMENTO */}
      <Dialog open={open && available && code} onClose={() => { setOpen(false); handleCompanySchedules(); handleRestartProps()}}>
        <Title
          $fontweight="600"
          $fontsize="1.1rem"
          $color="var(--color-brown)"
          $texttransform="uppercase"
        >
          Agendamento confirmado!
        </Title>
        <Separator $width="100%" $bordercolor="#ccc" $margin="1rem 0 3rem 0" />
        <form style={{ backgroundColor: "transparent", boxShadow: "none", width: "100%", padding: "0", textAlign: "center" }}>
          <span>Guarde o código abaixo para desmarcar:</span>
          <h3 style={{margin: '2rem 0'}}>{code}</h3>
          <span style={{fontSize: '12px', color: '#535353'}}>*recomendamos tirar print da tela</span>
          <Container
              $width="auto"
              $display="flex"
              $alignitems="center"
              $justifycontent="center"
              $margin="2rem 0 0 0"
              $backgroundcolor="transparent"
          >
              <Button
                variant="confirm"
                type="button"
                onClick={() => { setOpen(false); handleCompanySchedules(); handleRestartProps()}}
            >
                OK
            </Button>
          </Container>
          <ToastContainer position="top-right" autoClose={3000} closeButton={false} />
        </form>
      </Dialog>
      {/* PREENCHIMENTO DADOS CANCELAMENTO DO AGENDAMENTO */}
      <Dialog open={open && !available && !error} onClose={() => {setOpen(false); handleRestartProps()}}>
        <Title
          $fontweight="600"
          $fontsize="1.1rem"
          $color="var(--color-brown)"
          $texttransform="uppercase"
        >
          Cancele seu agendamento
        </Title>
        <Separator $width="100%" $bordercolor="var(--color-dark)" $margin="1rem 0 3rem 0" />
        <form style={{ backgroundColor: "transparent", boxShadow: "none", width: "100%", padding: "0" }}>
          <Label>Data:</Label>
          <DialogInput type="text" value={selectedSchedule.data} readOnly />
          <Label>Horário:</Label>
          <DialogInput type="text" value={selectedSchedule.horario} readOnly />
          <Label>Nome:</Label>
          <DialogInput 
            type="text" 
            value={selectedSchedule.nome} 
            onChange={(e) => setSelectedSchedule({ ...selectedSchedule, nome: e.target.value })}
            readOnly
          />
          <Label>Digite seu telefone com DDD:</Label>
          <DialogInput 
            type="text" 
            value={formataNumeroTelefone(selectedSchedule.telefone || "")} 
            onChange={(e) => setSelectedSchedule({ ...selectedSchedule, telefone: formataNumeroTelefone(e.target.value) }) }
          />
          <Label>Digite seu código de cancelamento:</Label>
          <DialogInput 
            type="text" 
            value={code} 
            onChange={(e) => setCode(e.target.value)}
          />
          <Separator $width="100%" $bordercolor="#ccc" />
          <Container
              $width="auto"
              $display="flex"
              $alignitems="flex-end"
              $justifycontent="space-between"
              $margin="0"
              $backgroundcolor="transparent"
          >
            <Button
              variant="link"
              type="button"
              onClick={() => {setOpen(false); handleRestartProps()}}
            >
                Voltar
            </Button>
            <Button
              type="button"
              variant={!code || !selectedSchedule.telefone ? "disabled" : "confirm"}
              onClick={makeCancelSchedule}
            >
                Cancelar
            </Button>
          </Container>
          <ToastContainer position="top-right" autoClose={3000} closeButton={false} />
        </form>
      </Dialog>
      {/* CANCELAMENTO NÃO POSSÍVEL */}
      {companyInfo && 
        <Dialog open={open && !available && error} onClose={() => {setOpen(false); handleRestartProps()}}>
          <Title
            $fontweight="600"
            $fontsize="1.1rem"
            $color="var(--color-brown)"
            $texttransform="uppercase"
          >
            Não foi possível cancelar seu agendamento
          </Title>
          <Separator $width="100%" $bordercolor="#ccc" $margin="1rem 0 3rem 0" />
          <form style={{ backgroundColor: "transparent", boxShadow: "none", width: "100%", padding: "0" }}>
            <span>
              {error}
            </span>
            <Container
                $width="auto"
                $display="flex"
                $alignitems="flex-end"
                $justifycontent="space-between"
                $margin="2rem 0 0 0"
                $backgroundcolor="transparent"
            >
              <Button
                style={{ fontSize: "0.8rem", padding: "0.5rem 1rem", backgroundColor: "transparent", borderColor: "transparent", color: "#000000" }}
                onClick={() => {setOpen(false); handleRestartProps()}}
              >
                  Voltar
              </Button>
              <Button
                style={{ fontSize: "0.8rem", padding: "0.5rem 1rem", backgroundColor: "#00832D", borderColor: "#00832D", display: "flex", alignItems: "center", gap: ".25rem" }}
                onClick={() => openWhatsApp(companyInfo.whatsapp)}
              >
                <WhatsApp/> Falar com {companyInfo.name}
              </Button>
            </Container>
            <ToastContainer position={mobile ? "bottom-center": "top-right"} autoClose={3000} closeButton={false} />
          </form>
        </Dialog>
      }
      {/* LOADING */}
      {loading && companyInfo === undefined &&
        <Container 
          $width="100%" 
          $height="100vh" 
          $margin="0" 
          $padding="0" 
          $backgroundcolor="none"
          $borderradius="0" 
          $border="none"
          $display="flex" 
          $justifycontent="center" 
          $alignitems="center"
          $boxshadow="none"
        >
          <span className="loader"></span>
        </Container>
      }
    </>
  );
}

export const DialogInput = styled.input`
  width: 100%;
  padding: 8px 4px;
  margin-bottom: 1.25rem;

  background-color: transparent;
  border: none;
  border-bottom: 1px solid var(--color-olive);

  font-size: 14px;
  color: var(--color-dark);

  &:focus {
    outline: none;
    border-bottom-color: var(--color-sage);
  }
`;

export const Label = styled.label`
  font-size: 12px;
  color: var(--color-olive);
  margin-bottom: 4px;
  display: block;
`;