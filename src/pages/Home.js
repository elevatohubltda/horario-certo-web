import React, { useEffect } from "react";
import Slider from "react-slick";
import { ReactComponent as ArrowLeft } from '../assets/icons/arrow-left.svg';
import { ReactComponent as ArrowRight } from '../assets/icons/arrow-right.svg';
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
import { Button } from "react-bootstrap";
import { createReservedSchedule, removeReservedSchedule } from "../services/endpoints/reservedSchedule";
import { ToastContainer, toast } from "react-toastify";
import { openWhatsApp } from "../util/util";
import { WhatsApp } from '@mui/icons-material';

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
    endDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0],
  });
  const { companyUrl } = useParams();
  const [loading, setLoading] = React.useState(true);
  const [loadingSchedule, setLoadingSchedule] = React.useState(true);
  const [companyInfo, setCompanyInfo] = React.useState();
  const [horarios, setHorarios] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [selectedSchedule, setSelectedSchedule] = React.useState(
    {
      data: "",
      horario: "",
      nome: "",
      telefone: ""
    }
  );
  const [available, setAvailable] = React.useState()
  const [code, setCode] = React.useState()
  const [error, setError] = React.useState()

  const handleFilter = (name, index, startDate, endDate) => {
    switch (name) {
      case "3 dias":
        setFilter({
          name: name,
          indexActive: index,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0],
        });
        break;
      case "7 dias":
        setFilter({
          name: name,
          indexActive: index,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
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
      await sleep(2000);
      setCompanyInfo(response.data);
      setLoading(false);
    } catch (error) {
      toast.error("Erro ao buscar os dados da empresa:", error);
      setLoading(false);
    }
  }

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const handleCompanySchedules = async () => {
    setLoadingSchedule(true);
    try { 
      const response = await getCompanySchedules(companyUrl, filter.startDate, filter.endDate);
      await sleep(2000);
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
    setOpen(true);
  }

  const makeSchedule = async () => {
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
      toast.error("Erro ao criar agendamento:", error);
    }
  }

  const makeCancelSchedule = async () => {
    const scheduleISOFormat = formatSchedulesToISO({date: selectedSchedule.data, schedules: [selectedSchedule.horario]});
    const reservedSchedule = {
      telephone: selectedSchedule.telefone.replace(/\D/g, ''),
      schedule: scheduleISOFormat[0],
      cancelCode: code
    }
    try {
      await removeReservedSchedule(companyUrl, reservedSchedule);
      toast.success("Agendamento cancelado com sucesso!");
      setOpen(false);
    } catch (error) {
      if(error.status === 422){
        setError(error.response.data);
      } else{
        toast.error("Erro ao cancelar agendamento:", error);
      }
    }
  }

  useEffect(() => {
    handleCompanySchedules();
  }, [filter]);

  useEffect(() => {
    getCompanyInfo();
  }, [companyUrl]);

  return (
    <>
      {companyInfo && 
        <>
          <Topbar 
            name={companyInfo.name} 
            imagem={companyInfo.imagem}
            whatsapp={companyInfo.whatsapp} 
            instagram={companyInfo.instagram}
          />
          <CustomFilterStyle $width="80%">
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
              {!loadingSchedule && horarios.length > 0 && horarios.map((item, index) => (
                <div key={index} className="slide">
                  <h3>{item.data}</h3>
                  <span>{"("+getWeekDay(item.data)+")"}</span>
                  <div className="horarios-container">
                    {item.horarios.map((iteminside, i) => (
                      <button 
                        key={i}
                        className={iteminside.available === false ? 'horario-btn horario-btn-unavailable' : 'horario-btn'}
                        onClick={() => selectSchedule(item.data, iteminside.horario, iteminside.available, iteminside.name)}
                      >
                        {iteminside.horario}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {!loadingSchedule && horarios.length === 0 && 
                <div className="slide no-schedules">
                  <h3>Nenhum horário disponível</h3>
                  <p>Verifique novamente mais tarde.</p>
                </div>
              }
              {loadingSchedule &&
                <div className="loading-slide">
                  <ThreeDots color="#6A5ACD" height={20} width={60} />
                  <p>Buscando horários...</p>
                </div>
              }
            </Slider>
          </Container>
        </>
      }
      <Dialog open={open && available && !code} onClose={() => setOpen(false)}>
        <Title
          $fontweight="600"
          $fontsize="1.25rem"
          $color="#6A5ACD"
          $texttransform="uppercase"
        >
          Confirme seu agendamento
        </Title>
        <Separator $width="100%" $bordercolor="#ccc" $margin="1rem 0 3rem 0" />
        <form style={{ backgroundColor: "transparent", boxShadow: "none", width: "100%", padding: "0" }}>
          <label>Data:</label>
          <input type="text" value={selectedSchedule.data} readOnly />
          <label>Horário:</label>
          <input type="text" value={selectedSchedule.horario} readOnly />
          <label>Digite seu nome:</label>
          <input 
            type="text" 
            value={selectedSchedule.nome} 
            onChange={(e) => setSelectedSchedule({ ...selectedSchedule, nome: e.target.value })}
          />
          <label>Digite seu telefone com DDD:</label>
          <input 
            type="text" 
            value={formataNumeroTelefone(selectedSchedule.telefone || "")} 
            onChange={(e) => setSelectedSchedule({ ...selectedSchedule, telefone: formataNumeroTelefone(e.target.value) }) }
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
              style={{ fontSize: "0.8rem", padding: "0.5rem 1rem", backgroundColor: "transparent", borderColor: "transparent", color: "#6A5ACD" }}
              onClick={() => setOpen(false)}
            >
                Voltar
            </Button>
            <Button
              style={{ fontSize: "0.8rem", padding: "0.5rem 1rem", backgroundColor: "#6A5ACD", borderColor: "#6A5ACD" }}
              onClick={makeSchedule}
              disabled={!selectedSchedule.nome || !selectedSchedule.telefone}
            >
                Agendar
            </Button>
          </Container>
        </form>
      </Dialog>
      <Dialog open={open && available && code} onClose={() => { setOpen(false); setCode(); }}>
        <Title
          $fontweight="600"
          $fontsize="1.25rem"
          $color="#6A5ACD"
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
                style={{ fontSize: "0.8rem", padding: "0.5rem 1rem", backgroundColor: "transparent", borderColor: "#6A5ACD", color: "#6A5ACD" }}
                onClick={() => { setOpen(false); setCode();}}
            >
                OK
            </Button>
          </Container>
          <ToastContainer position="top-right" autoClose={3000} closeButton={false} />
        </form>
      </Dialog>
      <Dialog open={open && !available && !error} onClose={() => setOpen(false)}>
        <Title
          $fontweight="600"
          $fontsize="1.25rem"
          $color="#6A5ACD"
          $texttransform="uppercase"
        >
          Cancele seu agendamento
        </Title>
        <Separator $width="100%" $bordercolor="#ccc" $margin="1rem 0 3rem 0" />
        <form style={{ backgroundColor: "transparent", boxShadow: "none", width: "100%", padding: "0" }}>
          <label>Data:</label>
          <input type="text" value={selectedSchedule.data} readOnly />
          <label>Horário:</label>
          <input type="text" value={selectedSchedule.horario} readOnly />
          <label>Nome:</label>
          <input 
            type="text" 
            value={selectedSchedule.nome} 
            onChange={(e) => setSelectedSchedule({ ...selectedSchedule, nome: e.target.value })}
            readOnly
          />
          <label>Digite seu telefone com DDD:</label>
          <input 
            type="text" 
            value={formataNumeroTelefone(selectedSchedule.telefone || "")} 
            onChange={(e) => setSelectedSchedule({ ...selectedSchedule, telefone: formataNumeroTelefone(e.target.value) }) }
          />
          <label>Digite seu código de cancelamento:</label>
          <input 
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
              style={{ fontSize: "0.8rem", padding: "0.5rem 1rem", backgroundColor: "transparent", borderColor: "transparent", color: "#6A5ACD" }}
              onClick={() => setOpen(false)}
            >
                Voltar
            </Button>
            <Button
              style={{ fontSize: "0.8rem", padding: "0.5rem 1rem", backgroundColor: "#d80101", borderColor: "#d80101" }}
              onClick={makeCancelSchedule}
              disabled={!selectedSchedule.code && !selectedSchedule.telefone}
            >
                Cancelar
            </Button>
          </Container>
          <ToastContainer position="top-right" autoClose={3000} closeButton={false} />
        </form>
      </Dialog>
      {companyInfo && 
        <Dialog open={open && !available && error} onClose={() => {setOpen(false); setError()}}>
          <Title
            $fontweight="600"
            $fontsize="1.25rem"
            $color="#6A5ACD"
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
                onClick={() => {setOpen(false); setError()}}
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
            <ToastContainer position="top-right" autoClose={3000} closeButton={false} />
          </form>
        </Dialog>
      }
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
        >
          <span className="loader"></span>
        </Container>
      }
    </>
  );
}