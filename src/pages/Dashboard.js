import React, { useEffect } from "react";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import "../styles/index.css";
import Topbar from "../components/topbar";
import { Container } from "../components/container/style";
import { CustomFilterStyle } from "../components/filter/style";
import { getCompany, getCompanySchedulesAuth } from "../services/endpoints/company";
import DateRangeSelector from "../components/dateRangeSelector";
import Cookies from "js-cookie";
import Sidebar from "../components/sidebar";
import { isAvailableLogin } from "../util/auth";
import { useNavigate } from "react-router-dom";
import SortedTable from "../components/sortedTable";
import { isMobile } from "../util/util";
import Alert from "../components/alert";
import { getClientStatus } from "../services/endpoints/payment";
import { expiresAt } from "../util/date";
import FilterDropdown from "../components/filterDropdown";

export default function Dashboard() {
  const navigate = useNavigate();
  const companyUrl = Cookies.get("companyUrl");
  const [companyInfo, setCompanyInfo] = React.useState(Cookies.get("companyInfo") ? JSON.parse(Cookies.get("companyInfo")) : undefined);
  const filters = [
    { label: "Sem filtro", value: "", color: "" },
    { label: "Expirado", value: "expired", color: "#9e9e9e" },
    { label: "Disponível", value: "available", color: "#4caf50" },
    { label: "Agendado", value: "scheduled", color: "#f44336" },
    { label: "Concluído", value: "done", color: "#2196f3" }
  ];
  const [filter, setFilter] = React.useState({
    name: "3 dias",
    indexActive: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0],
  });
  const [loading, setLoading] = React.useState(true);
  const [loadingSchedule, setLoadingSchedule] = React.useState(true);
  const [horarios, setHorarios] = React.useState([]);
  const [mobile, setMobile] = React.useState();
  const [paymentStatus, setPaymentStatus] = React.useState();
  const [activeFilter, setActiveFilter] = React.useState(filters[0]);
  const [filtered, setFiltered] = React.useState();

  const filterSchedulesByDropdown = (value) => {
    const now = new Date()
      .toLocaleString("sv-SE", {
        timeZone: "America/Sao_Paulo",
        hour12: false
      }).replace(" ", "T");
    if(value === ''){
      setActiveFilter(filters[0]);
    }
    switch (value) {
      case "available": {
        const filtered = horarios.filter(item =>
          item.available === true &&
          item.schedule > now
        );
        setActiveFilter(value);
        setFiltered(filtered);
        break;
      }

      case "expired": {
        const filtered = horarios.filter(item =>
          item.schedule <= now && item.available === true
        );
        setFiltered(filtered);
        break;
      }

      case "scheduled": {
        const filtered = horarios.filter(item =>
          item.available === false &&
          item.schedule > now
        );
        setFiltered(filtered);
        break;
      }

      case "done": {
        const filtered = horarios.filter(item =>
          item.available === false &&
          item.schedule <= now
        );
        setFiltered(filtered);
        break;
      }

      default:
        setFiltered(horarios);
        break;
    }
  };

  const handleFilter = (name, index, startDate, endDate) => {
    switch (name) {
      case "3 dias":
        filterSchedulesByDropdown('');
        setFilter({
          name: name,
          indexActive: index,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0],
        });
        break;
      case "7 dias":
        filterSchedulesByDropdown('');
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
        filterSchedulesByDropdown('');
        setFilter({
          name: name,
          indexActive: index,
          startDate: new Date(startDate).toISOString().split('T')[0],
          endDate: new Date(endDate).toISOString().split('T')[0],
        });
        break;
    }
  };

  const handleCompanySchedules = async () => {
    setLoadingSchedule(true);
    try { 
      var response = await getCompanySchedulesAuth(companyUrl, filter.startDate, filter.endDate);
      setFiltered(undefined);
      setHorarios(response.data);
      setLoadingSchedule(false);
    } catch (error) {
      console.error("Erro ao buscar os dados da empresa:", error);
      setLoadingSchedule(false);
    }
  }

  const getClientStatusInfo = async () => {
    try {
      var response = await getClientStatus(companyUrl);
      setPaymentStatus(response.data);
    } catch (error) {
      console.error("Erro ao buscar o status de pagamento:", error);
    }
  }

  const getCompanyInfo = async () => {
      try {
        var response = await getCompany(companyUrl);
        Cookies.set("companyInfo", JSON.stringify(response.data), {
          expires: expiresAt,
          secure: true,
          sameSite: "Strict",
        });
        setCompanyInfo(response.data);
      } catch (error) {
        console.error("Erro ao buscar os dados da empresa:", error);
      }
  }

  useEffect(() => {
    handleCompanySchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, companyUrl]);

  useEffect(() => {
    if(isAvailableLogin()) {
      setLoading(true);
      if(companyInfo === undefined || companyInfo === null) {
        getCompanyInfo();
      }
      getClientStatusInfo();
      setMobile(isMobile()); 
      setLoading(false);
    } else{
      navigate("/"+companyUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyUrl, navigate]);

  return (
    <>
      {companyInfo && 
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
                    {paymentStatus && paymentStatus !== '' && 
                      <Alert
                        badge={paymentStatus.badge}
                        message={paymentStatus.message}
                      />
                    }
                    <CustomFilterStyle $width="100%" $padding="1rem 0 0 0">
                      <FilterDropdown
                        filters={filters}
                        activeFilter={activeFilter}
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
                    <SortedTable data={filtered ? filtered : horarios} loading={loadingSchedule} isMobile={mobile} onChange={handleCompanySchedules}/>
                </Sidebar>
            </Container>
        </>
      }
    </>
  );
}