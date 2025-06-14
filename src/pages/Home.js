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
import { transformarHorariosPorData } from "../util/format";
import { ThreeDots } from "react-loader-spinner";
import DateRangeSelector from "../components/dateRangeSelector";


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
          console.error("startDate e endDate são obrigatórios para esse filtro.");
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
      console.error("Erro ao buscar os dados da empresa:", error);
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
      console.error("Erro ao buscar os dados da empresa:", error);
      setLoadingSchedule(false);
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
                    {item.horarios.map((horario, i) => (
                      <button 
                        key={i} 
                        className="horario-btn"
                        onClick={() => alert(`Horário selecionado: ${horario}`)}
                      >
                        {horario}
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