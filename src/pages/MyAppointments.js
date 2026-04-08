import React, { useEffect } from "react";
import styled from "styled-components";
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
import { expiresAt } from "../util/date";
import FilterDropdown from "../components/filterDropdown";

const PageActions = styled.div`
  display: flex;
  justify-content: space-between;
  justify-content: ${({ $justifycontent = 'center' }) => $justifycontent};
  margin: ${({ $margin = '1rem 0rem' }) => $margin};
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  cursor: pointer;
  border: none;
  border-radius: 999px;
  padding: 0.85rem 1.25rem;
  font-weight: 600;
  font-size: 0.95rem;
  transition: background-color 0.2s ease, color 0.2s ease;

  &:first-child {
    background: transparent;
    color: var(--color-dark);
    border: 1px solid rgba(30, 44, 40, 0.16);

    &:hover {
      background-color: var(--color-sage);
      color: #fff;
      border-color: var(--color-sage);
    }
  }

  &:last-child {
    border-color: var(--color-dark);
    color: var(--color-dark);
  }
`;

export default function MyAppointments() {
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
    endDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0],
  });
  const [loading, setLoading] = React.useState(true);
  const [loadingSchedule, setLoadingSchedule] = React.useState(true);
  const [horarios, setHorarios] = React.useState([]);
  const [mobile, setMobile] = React.useState();
  const [activeFilter, setActiveFilter] = React.useState(filters[0]);
  const [filtered, setFiltered] = React.useState();

  const filterSchedulesByDropdown = (value) => {
    const selected = value;

    if (selected === "expired") {
      const expired = horarios.filter((item) => item.status === "expired");
      setFiltered(expired);
      setActiveFilter(filters[1]);
      return;
    }

    if (selected === "available") {
      const available = horarios.filter((item) => item.status === "available");
      setFiltered(available);
      setActiveFilter(filters[2]);
      return;
    }

    if (selected === "scheduled") {
      const scheduled = horarios.filter((item) => item.status === "scheduled");
      setFiltered(scheduled);
      setActiveFilter(filters[3]);
      return;
    }

    if (selected === "done") {
      const done = horarios.filter((item) => item.status === "done");
      setFiltered(done);
      setActiveFilter(filters[4]);
      return;
    }

    setFiltered(undefined);
    setActiveFilter(filters[0]);
  };

  const handleFilter = (name, index, startDate, endDate) => {
    switch (name) {
      case "3 dias":
        filterSchedulesByDropdown('');
        setFilter({
          name: name,
          indexActive: index,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0],
        });
        break;
      case "7 dias":
        filterSchedulesByDropdown('');
        setFilter({
          name: name,
          indexActive: index,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(new Date().setDate(new Date().getDate() + 6)).toISOString().split('T')[0],
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
                $width="100%"
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
                      $boxshadow="none"
                    >
                      <span className="loader"></span>
                    </Container>
                  }
                <PageActions $margin="1rem 0 0 0" $justifycontent={!mobile ? "end" : "end"}>
                  <ActionButton onClick={() => navigate('/criar-agendamentos')}>Criar agendamentos</ActionButton>
                </PageActions>
                <CustomFilterStyle $margin="0" $width="100%" $padding="1rem 0 0 0">
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
