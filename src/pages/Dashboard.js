import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import "../styles/index.css";
import { PageLayout } from "../components/admin";
import Alert from "../components/alert";
import { isAvailableLogin, isProfessional, setSecureCookie, redirectToLogin } from "../util/auth";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { getClientStatus } from "../services/endpoints/payment";
import { Clock, CalendarDays, Check, Filter, Wallet, Percent, TrendingUp } from "lucide-react";
import { getCompany, getCompanyProperties, getCompanySchedulesAuth } from "../services/endpoints/company";
import { fetchMaxProfessionals } from "../services/endpoints/professional";
import { formatMoney, summarizeProfessionalRevenue, summarizeRevenue } from "../util/revenue";
import { expiresAt } from "../util/date";


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
  border-radius: var(--ui-radius);
  padding: 1.25rem;
  border: none;
  box-shadow: var(--ui-card-shadow);
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
  border-radius: var(--ui-radius);
  padding: 1.5rem;
  border: none;
  box-shadow: var(--ui-card-shadow);
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

const CardTitle = styled.div`
  color: var(--ui-text);
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
  const [paymentStatus, setPaymentStatus] = useState();
  const [selectedPeriod, setSelectedPeriod] = useState("essa semana");
  // No modo de agenda "Simples" a lista completa fica na agenda semanal
  const [scheduleMode, setScheduleMode] = useState("PADRAO");
  const [openFilterMenu, setOpenFilterMenu] = useState(false);
  const [schedules, setSchedules] = useState([]);
  // Plano com equipe: mostra comissão e faturamento total além do faturamento do dono
  const [hasTeam, setHasTeam] = useState(false);

  useEffect(() => {
    if (!companyUrl || isProfessional()) return;
    fetchMaxProfessionals(companyUrl).then((max) => setHasTeam(max > 1));
  }, [companyUrl]);

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
      // Consulta autenticada: traz valores e comissões (a pública não expõe esses dados).
      // Para o profissional da equipe, o backend devolve só os agendamentos dele.
      const response = await getCompanySchedulesAuth(companyUrl, startDate, endDate);
      setSchedules(response.data || []);
    } catch (error) {
      console.error("Erro ao buscar os agendamentos do dashboard:", error);
      setSchedules([]);
    }
  };

  const isFutureAvailableSchedule = (item) => {
    if (item?.available !== true || !item?.schedule) return false;
    const scheduleDate = new Date(item.schedule);
    if (Number.isNaN(scheduleDate.getTime())) return false;
    return scheduleDate > new Date();
  };

  const completedSchedules = schedules.filter((item) => item.available === false).length;
  const openSchedules = schedules.filter((item) => isFutureAvailableSchedule(item)).length;
  const totalSchedules = completedSchedules + openSchedules;

  // Números financeiros são do dono: faturamento dos atendimentos dele, comissão da equipe e o total
  const finance = summarizeRevenue(schedules);
  // Profissional da equipe: o backend devolve só os agendamentos dele
  const professionalFinance = summarizeProfessionalRevenue(schedules);
  const financeCards = isProfessional()
    ? [
        { title: "Faturamento dos seus atendimentos", value: formatMoney(professionalFinance.gross), icon: <Wallet size={18} />, description: `${selectedPeriod} · valor total cobrado` },
        { title: "Parte do estabelecimento", value: formatMoney(professionalFinance.establishmentShare), icon: <Percent size={18} />, description: `${selectedPeriod} · definida pelo dono em cada serviço` },
        { title: "Seu faturamento líquido", value: formatMoney(professionalFinance.net), icon: <TrendingUp size={18} />, description: "faturamento − parte do estabelecimento" },
      ]
    : hasTeam
    ? [
        { title: "Faturamento (seus atendimentos)", value: formatMoney(finance.revenue), icon: <Wallet size={18} />, description: selectedPeriod },
        { title: "Parte do estabelecimento (equipe)", value: formatMoney(finance.commission), icon: <Percent size={18} />, description: `${selectedPeriod} · sua parte nos atendimentos da equipe` },
        { title: "Faturamento total", value: formatMoney(finance.total), icon: <TrendingUp size={18} />, description: "seus atendimentos + parte do estabelecimento" },
      ]
    : [
        { title: "Faturamento", value: formatMoney(finance.revenue), icon: <Wallet size={18} />, description: selectedPeriod },
      ];

  const cards = [
    { title: "Agendamentos realizados", value: completedSchedules, icon: <Check size={18} />, description: selectedPeriod },
    { title: "Agendamentos em aberto", value: openSchedules, icon: <Clock size={18} />, description: selectedPeriod },
    { title: "Total de agendamentos", value: totalSchedules, icon: <CalendarDays size={18} />, description: selectedPeriod },
    ...financeCards,
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
        setSecureCookie("companyInfo", JSON.stringify(response.data), {
          expires: expiresAt,
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
      // Situação da assinatura é assunto do dono, não do profissional da equipe
      if (!isProfessional()) getClientStatusInfo();
      getCompanyProperties(companyUrl)
        .then((response) => setScheduleMode(response.data?.scheduleMode || "PADRAO"))
        .catch(() => {});
    } else {
      redirectToLogin(navigate);
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
            <PageLayout
              title="Bem-vindo de volta!"
              subtitle={isProfessional()
                ? "Acompanhe seus próximos atendimentos e o seu faturamento."
                : "Gerencie seus próximos agendamentos e acompanhe a situação do seu negócio."}
              actions={
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
              }
            >
                {paymentStatus && (
                  <Alert badge={paymentStatus.badge} message={paymentStatus.message} />
                )}

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
                        <FakeBadge style={{ cursor: 'pointer' }} onClick={() => navigate(scheduleMode === "SIMPLES" ? '/agenda-semanal' : '/agendamentos')}>
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
            </PageLayout>
      )}
    </>
  );
}
