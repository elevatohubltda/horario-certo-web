import { useEffect, useState } from "react";
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
import { Clock, CalendarDays, Check } from "lucide-react";
import { getCompany } from "../services/endpoints/company";
import { expiresAt } from "../util/date";


const HeaderSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
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
  const navigate = useNavigate();
  const companyUrl = Cookies.get("companyUrl");
  const [companyInfo, setCompanyInfo] = useState(Cookies.get("companyInfo") ? JSON.parse(Cookies.get("companyInfo")) : undefined);
  const [mobile, setMobile] = useState();
  const [paymentStatus, setPaymentStatus] = useState();

  const cards = [
    { title: "Agendamentos realizados", value: "25", icon: <Check size={18} />, description: "Esta semana" },
    { title: "Agendamentos em aberto", value: "10", icon: <Clock size={18} />, description: "Próximos dias" },
    { title: "Total de agendamentos", value: "35", icon: <CalendarDays size={18} />, description: "No mês" },
  ];

  const agenda = [
    { title: "Joao Paulo", time: "12:30", service: "Corte de Cabelo" },
    { title: "Nathan Jorge", time: "14:00", service: "Corte de Barba" },
    { title: "Mateus Gabriel", time: "16:00", service: "Tratamento Capilar" },
    { title: "Junior Silva", time: "18:00", service: "Design de Sobrancelha" },
  ];

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
            $borderradius="0"
            $boxshadow="none"
          >
            <Sidebar>
              <Container
                $width="90%"
                $borderradius="0 1rem 2rem 1rem"
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
                    <Subtitle>Gerencie suas próximas sessões e acompanhe o progresso dos clientes em um só lugar.</Subtitle>
                  </Greeting>
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
                        <FakeBadge style={{ cursor: 'pointer' }} onClick={() => navigate('/meus-agendamentos')}>
                          Ver tudo
                        </FakeBadge>
                      </CardHeader>
                      <AgendaList>
                        {agenda.map((item) => (
                          <AgendaItem key={item.title}>
                            <AgendaInfo>
                              <strong>{item.title}</strong>
                              <AgendaTime>{item.time}</AgendaTime>
                            </AgendaInfo>
                            <TagChip>{item.service}</TagChip>
                          </AgendaItem>
                        ))}
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
