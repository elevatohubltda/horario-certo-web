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

export default function Dashboard() {
  const [filter, setFilter] = React.useState({
    name: "3 dias",
    indexActive: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0],
  });
  const [loading, setLoading] = React.useState(true);
  const [loadingSchedule, setLoadingSchedule] = React.useState(true);
  const [companyInfo, setCompanyInfo] = React.useState(Cookies.get("companyInfo") ? Cookies.get("companyInfo") : undefined);
  const companyUrl = Cookies.get("companyUrl");
  const [horarios, setHorarios] = React.useState([]);
  const navigate = useNavigate();
  const [mobile, setMobile] = React.useState();

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
  
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  useEffect(() => {
    const handleCompanySchedules = async () => {
      setLoadingSchedule(true);
      try { 
        const response = await getCompanySchedulesAuth(companyUrl, filter.startDate, filter.endDate);
        await sleep(2000);
        setHorarios(response.data);
        setLoadingSchedule(false);
      } catch (error) {
        console.error("Erro ao buscar os dados da empresa:", error);
        setLoadingSchedule(false);
      }
    }

    handleCompanySchedules();
  }, [filter, companyUrl]);

  useEffect(() => {
    const getCompanyInfo = async () => {
      setLoading(true); 
      try {
        const response = await getCompany(companyUrl);
        await sleep(2000);
        Cookies.set("companyInfo", JSON.stringify(response.data), {
          expires: 1,
          secure: true,
          sameSite: "Strict",
        });
        setCompanyInfo(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar os dados da empresa:", error);
        setLoading(false);
      }
    }
    if(isAvailableLogin()) {
      if(companyInfo === undefined || companyInfo === null) {
        getCompanyInfo();
      }
      setMobile(isMobile()); 
    } else{
      navigate("/"+companyUrl);
    }
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
                    <CustomFilterStyle $width="100%" $padding="1rem 0 0 0">
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
                    <SortedTable data={horarios} loading={loadingSchedule}/>
                </Sidebar>
            </Container>
        </>
      }
    </>
  );
}