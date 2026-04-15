import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import "../styles/index.css";
import Topbar from "../components/topbar";
import Sidebar from "../components/sidebar";
import { Container } from "../components/container/style";
import { Title } from "../components/title";
import Alert from "../components/alert";
import { isAvailableLogin } from "../util/auth";
import { isMobile } from "../util/util";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { getClientStatus } from "../services/endpoints/payment";
import { Clock, CalendarDays, Check, Filter } from "lucide-react";
import { getCompany, getCompanySchedules } from "../services/endpoints/company";
import { expiresAt } from "../util/date";


const HeaderSection = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
`;

const FilterWrapper = styled.div`
  position: relative;
`;

const FilterButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: #fff;
  color: var(--color-dark);
  border-radius: 999px;
  padding: 0.55rem 0.9rem;
  font-size: 0.85rem;
  cursor: pointer;

  &:hover {
    border-color: rgba(0, 0, 0, 0.2);
  }
`;

const FilterMenu = styled.div`
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 180px;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #fff;
  box-shadow: 0 18px 24px rgba(0, 0, 0, 0.08);
  padding: 0.4rem;
  z-index: 20;
`;

const FilterOption = styled.button`
  width: 100%;
  border: none;
  background: ${({ $active }) => ($active ? "rgba(142, 152, 142, 0.18)" : "transparent")};
  color: var(--color-dark);
  border-radius: 10px;
  padding: 0.5rem 0.7rem;
  text-align: left;
  font-size: 0.9rem;
  cursor: pointer;

  &:hover {
    background: rgba(142, 152, 142, 0.12);
  }
`;

const Greeting = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Subtitle = styled.p`
  margin: 0;
  color: var(--color-dark);
  opacity: 0.75;
`;

const FakeBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 0.9rem;
  border-radius: 999px;
  background: rgba(142, 152, 142, 0.12);
  font-size: 0.85rem;
  color: var(--color-dark);
  text-align: center;
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  width: 100%;
  margin-top: 1.5rem;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: #fff;
  border-radius: 24px;
  padding: 1.25rem;
  border: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const StatLabel = styled.span`
  font-size: 0.95rem;
  color: var(--color-dark);
  opacity: 0.85;
`;

const StatValue = styled.span`
  font-size: 1.85rem;
  font-weight: 700;
  color: var(--color-dark);
`;

const SectionGrid = styled.div`
  display: grid;
  align-items: start;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const ContentCard = styled.div`
  background: #fff;
  border-radius: 24px;
  padding: 1.5rem;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.05);
  width: fill-available;
  min-width: 0;
`;

const SectionItem = styled.div`
  grid-column: 1 / -1;
  width: 100%;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const CardTitle = styled(Title)`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
`;

const AgendaList = styled.div`
  display: grid;
  gap: 1rem;
`;

const AgendaItem = styled.div`
  background: #f9f9fb;
  border-radius: 18px;
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  min-height: 74px;
`;

const AgendaInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
`;

const AgendaTime = styled.span`
  color: rgba(30, 44, 40, 0.75);
  font-size: 0.9rem;
`;

const TagChip = styled.span`
  padding: 0.5rem 0.85rem;
  border-radius: 999px;
  background: rgba(142, 152, 142, 0.12);
  font-size: 0.85rem;
  color: var(--color-dark);
  white-space: nowrap;
`;

export default function Dashboard() {
  const filterOptions = ["essa semana", "próximos 15 dias", "próximos 30 dias"];
  const navigate = useNavigate();
  const companyUrl = Cookies.get("companyUrl");
  const filterRef = useRef(null);
  const [companyInfo, setCompanyInfo] = useState(Cookies.get("companyInfo") ? JSON.parse(Cookies.get("companyInfo")) : undefined);
  const [mobile, setMobile] = useState();
  const [paymentStatus, setPaymentStatus] = useState();
  const [selectedPeriod, setSelectedPeriod] = useState("essa semana");
  const [openFilterMenu, setOpenFilterMenu] = useState(false);
  const [schedules, setSchedules] = useState([]);

  const formatDateToApi = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getDateRangeByPeriod = (period) => {
    const startDate = new Date();
    const endDate = new Date();

    switch (period) {
      case "próximos 15 dias":
        endDate.setDate(endDate.getDate() + 14);
        break;
      case "próximos 30 dias":
        endDate.setDate(endDate.getDate() + 29);
        break;
      case "essa semana":
      default:
        endDate.setDate(endDate.getDate() + 6);
        break;
    }

    return {
      startDate: formatDateToApi(startDate),
      endDate: formatDateToApi(endDate),
    };
  };

  const getSchedulesByPeriod = async () => {
    if (!companyUrl) return;

    const { startDate, endDate } = getDateRangeByPeriod(selectedPeriod);

    try {
      const response = await getCompanySchedules(companyUrl, startDate, endDate);
      setSchedules(response.data || []);
    } catch (error) {
      console.error("Erro ao buscar os agendamentos do dashboard:", error);
      setSchedules([]);
    }
  };

  const completedSchedules = schedules.filter((item) => item.available === false).length;
  const openSchedules = schedules.filter((item) => item.available === true).length;
  const totalSchedules = completedSchedules + openSchedules;

  const cards = [
    { title: "Agendamentos realizados", value: completedSchedules, icon: <Check size={18} />, description: selectedPeriod },
    { title: "Agendamentos em aberto", value: openSchedules, icon: <Clock size={18} />, description: selectedPeriod },
    { title: "Total de agendamentos", value: totalSchedules, icon: <CalendarDays size={18} />, description: selectedPeriod },
  ];

  const upcomingAgenda = schedules
    .filter((item) => item.available === false && item.schedule)
    .map((item) => ({
      ...item,
      scheduleDate: new Date(item.schedule),
    }))
    .filter((item) => !Number.isNaN(item.scheduleDate.getTime()) && item.scheduleDate >= new Date())
    .sort((a, b) => a.scheduleDate - b.scheduleDate)
    .slice(0, 4)
    .map((item) => {
      const dateText = item.scheduleDate.toLocaleDateString("pt-BR");
      const timeText = item.scheduleDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      return {
        key: item.id || `${item.schedule}-${item.name || "sem-nome"}`,
        title: item.name || "Cliente",
        time: `${dateText} às ${timeText}`,
        service: item.service?.name || item.service || "Serviço não informado",
      };
    });

  const getClientStatusInfo = async () => {
    try {
      const response = await getClientStatus(companyUrl);
      setPaymentStatus(response.data);
    } catch (error) {
      console.error("Erro ao buscar o status de pagamento:", error);
    }
  };

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
    if (isAvailableLogin()) {
      if(companyInfo === undefined || companyInfo === null) {
        getCompanyInfo();
      }
      getClientStatusInfo();
      setMobile(isMobile());
    } else {
      navigate("/" + companyUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyUrl, navigate]);

  useEffect(() => {
    if (isAvailableLogin()) {
      getSchedulesByPeriod();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod, companyUrl]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setOpenFilterMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      {companyInfo && (
        <>
          <Topbar
            name={companyInfo.name}
            imagem={companyInfo.imagem}
            whatsapp={companyInfo.whatsapp}
            instagram={companyInfo.instagram}
            loggedIn={true}
          />
          <Container
            $width={!mobile ? "100%" : "100%"}
            $display="flex"
            $flexdirection="column"
            $padding={!mobile ? "0" : "1rem"}
            $margin="0"
            $backgroundcolor="transparent"
            $borderRadius="0"
            $boxshadow="none"
          >
            <Sidebar>
              <Container
                $width="90%"
                $borderRadius="0 1rem 2rem 1rem"
                $padding="0"
                $display="flex"
                $flexdirection="column"
                $backgroundcolor="transparent"
                $boxshadow="none"
              >
                {paymentStatus && (
                  <Alert badge={paymentStatus.badge} message={paymentStatus.message} />
                )}
                <HeaderSection>
                  <Greeting>
                    <Title $fontsize="2rem">Bem vindo de volta!</Title>
                    <Subtitle>Gerencie seus próximos agendamentos e acompanhe a situação do seu negócio.</Subtitle>
                  </Greeting>
                  <FilterWrapper ref={filterRef}>
                    <FilterButton type="button" onClick={() => setOpenFilterMenu((prev) => !prev)}>
                      <Filter size={16} />
                      {selectedPeriod}
                    </FilterButton>
                    {openFilterMenu && (
                      <FilterMenu>
                        {filterOptions.map((option) => (
                          <FilterOption
                            key={option}
                            type="button"
                            $active={selectedPeriod === option}
                            onClick={() => {
                              setSelectedPeriod(option);
                              setOpenFilterMenu(false);
                            }}
                          >
                            {option}
                          </FilterOption>
                        ))}
                      </FilterMenu>
                    )}
                  </FilterWrapper>
                </HeaderSection>

                <CardsGrid>
                  {cards.map((card) => (
                    <StatCard key={card.title}>
                      <CardHeader>
                        <StatLabel>{card.title}</StatLabel>
                        <FakeBadge>{card.icon}</FakeBadge>
                      </CardHeader>
                      <StatValue>{card.value}</StatValue>
                      <Subtitle>{card.description}</Subtitle>
                    </StatCard>
                  ))}
                </CardsGrid>

                <SectionGrid>
                  <SectionItem>
                    <ContentCard style={{ marginTop: '1.5rem' }}>
                      <CardHeader>
                        <CardTitle>Próximos Agendamentos</CardTitle>
                        <FakeBadge style={{ cursor: 'pointer' }} onClick={() => navigate('/agendamentos')}>
                          Ver tudo
                        </FakeBadge>
                      </CardHeader>
                      <AgendaList>
                        {upcomingAgenda.length > 0 ? (
                          upcomingAgenda.map((item) => (
                            <AgendaItem key={item.key}>
                              <AgendaInfo>
                                <strong>{item.title}</strong>
                                <AgendaTime>{item.time}</AgendaTime>
                              </AgendaInfo>
                              <TagChip>{item.service}</TagChip>
                            </AgendaItem>
                          ))
                        ) : (
                          <AgendaItem>
                            <AgendaInfo>
                              <strong>Nenhum agendamento futuro</strong>
                              <AgendaTime>Não há agendamentos confirmados no período selecionado.</AgendaTime>
                            </AgendaInfo>
                          </AgendaItem>
                        )}
                      </AgendaList>
                    </ContentCard>
                  </SectionItem>
                </SectionGrid>
              </Container>
            </Sidebar>
          </Container>
        </>
      )}
    </>
  );
}
