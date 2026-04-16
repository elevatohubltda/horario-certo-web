import React, { useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { ReactComponent as Logo } from '../assets/horario-certo-logo-horizontal.svg?component';
import { useNavigate } from 'react-router-dom';
import { getPublicSubscriptionPlans } from '../services/endpoints/payment';

const revealUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const drift = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-6px);
  }
  100% {
    transform: translateY(0px);
  }
`;

const shimmerLine = keyframes`
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 200% 50%;
  }
`;

const Page = styled.main`
  min-height: 100dvh;
  width: 100%;
  box-sizing: border-box;
  padding: 0.85rem;
  background: linear-gradient(135deg, #f4f5f2 0%, #ebece8 100%);

  @media (min-width: 768px) {
    padding: 1.35rem;
  }
`;

const Shell = styled.div`
  width: min(1180px, 100%);
  margin: 0 auto;
  border-radius: 1.15rem;
  border: 1px solid #d9ddd4;
  background: #f8f9f6;
  box-shadow: 0 24px 48px rgba(22, 29, 23, 0.1);
  overflow: hidden;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.7rem 1rem;
  border-bottom: 1px solid #dde1d8;
  background: #f8f9f6;

  @media (min-width: 768px) {
    padding: 1rem 1.4rem;
  }
`;

const Brand = styled.button`
  border: none;
  background: transparent;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  cursor: pointer;
  color: var(--color-dark);
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 0.95rem;

  svg {
    width: max-content;
    height: 64px;
    margin-left: 6px;

    @media (min-width: 768px) {
      height: 72px;
      margin-left: 10px;
    }
  }
`;

const OutlineButton = styled.button`
  height: 2.2rem;
  padding: 0 0.95rem;
  border-radius: 999px;
  border: 1px solid rgba(30, 44, 40, 0.2);
  background: #ffffff;
  color: var(--color-dark);
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(30, 44, 40, 0.35);
    box-shadow: 0 8px 18px rgba(30, 44, 40, 0.13);
  }
`;

const PrimaryButton = styled.button`
  height: 2.2rem;
  padding: 0 0.95rem;
  border-radius: 999px;
  border: none;
  background: #101010;
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 20px rgba(20, 34, 30, 0.28);
    filter: saturate(1.07);
  }
`;

const Hero = styled.section`
  padding: 1rem;

  @media (min-width: 768px) {
    padding: 1.6rem 2rem 1.2rem;
  }
`;

const HeroBadge = styled.span`
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  column-gap: 0.4rem;
  margin: 0 auto 0.55rem;
  max-width: min(100%, 22rem);
  width: fit-content;
  padding: 0.35rem 0.78rem;
  border-radius: 0.9rem;
  border: 2px solid var(--color-sage);
  background: linear-gradient(135deg, rgba(142, 152, 142, 0.12) 0%, rgba(142, 152, 142, 0.08) 100%);
  color: #2d483a;
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1.25;
  text-align: center;

  &::before {
    content: '✓';
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
    border-radius: 999px;
    background: var(--color-sage);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    font-weight: 900;
    font-size: 0.7rem;
  }

  @media (max-width: 480px) {
    max-width: calc(100% - 0.4rem);
    padding: 0.35rem 0.62rem;
    font-size: 0.74rem;
  }

`;

const FloatingGroup = styled.div`
  margin: 0 auto 1rem;
  width: fit-content;
  display: flex;
  align-items: center;
  padding: 0.2rem 0.35rem 0.2rem 0.6rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(135, 139, 131, 0.2);
  box-shadow: 0 8px 20px rgba(30, 44, 40, 0.08);

  span {
    width: 2rem;
    height: 2rem;
    border-radius: 999px;
    border: 2px solid #ffffff;
    margin-left: -0.3rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    font-size: 0.65rem;
    font-weight: 700;
    background: var(--color-sage);
    animation: ${drift} 4s ease-in-out infinite;
  }

  span:nth-child(2) {
    background: var(--color-olive);
    animation-delay: 0.15s;
  }

  span:nth-child(3) {
    background: var(--color-brown);
    animation-delay: 0.3s;
  }

  span:nth-child(4) {
    background: var(--color-dark);
    animation-delay: 0.45s;
  }
`;

const HeroTitle = styled.h1`
  margin: 0;
  color: #10140f;
  line-height: 1.12;
  font-family: 'Montserrat', sans-serif;
  font-size: clamp(1.9rem, 8vw, 3.4rem);

  strong {
    color: var(--color-brown);
  }
`;

const HeroText = styled.p`
  margin: 2rem auto 2rem;
  max-width: 980px;
  text-align: center;
  color: #4e5a4d;
  line-height: 1.55;
  font-size: 0.96rem;
`;

const HeroCtas = styled.div`
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.55rem;
`;

const Features = styled.section`
  padding: 1rem;

  @media (min-width: 768px) {
    padding: 1.3rem 2rem 1.8rem;
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;

  @media (min-width: 980px) {
    grid-template-columns: 1fr 1fr 1fr 1.4fr;
  }
`;

const FeatureCard = styled.article`
  border-radius: 0.95rem;
  padding: 1rem;
  background: #ffffff;
  border: 1px solid #d9ddd4;
  animation: ${revealUp} 0.5s ease both;
  animation-delay: ${({ $delay }) => $delay || '0s'};
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(109, 92, 67, 0.35);
    box-shadow: 0 14px 24px rgba(30, 44, 40, 0.12);
  }

  h3 {
    margin: 0.6rem 0 0;
    font-size: 1.1rem;
    line-height: 1.25;
    color: #1a2118;
  }

  p {
    margin: 0.55rem 0 0;
    color: #627061;
    font-size: 0.85rem;
    line-height: 1.45;
  }
`;

const Dot = styled.span`
  width: 2rem;
  height: 2rem;
  border-radius: 0.7rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 700;
  background: ${({ $tone }) => $tone};
`;

const HighlightCard = styled.article`
  border-radius: 0.95rem;
  padding: 1rem;
  background: linear-gradient(160deg, #ffffff 0%, #f4f7f0 100%);
  border: 1px solid #d9ddd4;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: auto -15% -45% -15%;
    height: 60%;
    background: radial-gradient(circle, rgba(142, 152, 142, 0.22) 0%, rgba(109, 92, 67, 0) 68%);
    pointer-events: none;
  }

  span {
    width: fit-content;
    border-radius: 999px;
    border: 1px solid #d4d9d0;
    color: #4f604f;
    font-size: 0.75rem;
    padding: 0.22rem 0.62rem;
  }

  h3 {
    margin: 0.8rem 0 0;
    font-size: clamp(1.5rem, 3vw, 2rem);
    line-height: 1.12;
    color: #182218;
  }

  p {
    margin: 0.6rem 0 0;
    color: #5f695f;
    line-height: 1.45;
  }
`;

const PlansSection = styled.section`
  padding: 1rem;
  position: relative;

  @media (min-width: 768px) {
    padding: 0 2rem 2rem;
  }
`;

const PlansHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  margin-bottom: 0.9rem;

  h2 {
    margin: 0;
    color: #121912;
    font-size: clamp(1.5rem, 4vw, 2.1rem);
    line-height: 1.15;
  }
`;

const PlansMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.55rem;
`;

const ControlButton = styled.button`
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  border: 1px solid rgba(30, 44, 40, 0.2);
  background: #ffffff;
  color: #1e2c28;
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const PlansCarousel = styled.div`
  border-radius: 1rem;
  border: 1px solid #d9ddd4;
  background: linear-gradient(180deg, #fafbf8 0%, #f6f8f4 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
  padding: 0.8rem;

  @media (min-width: 768px) {
    padding: 1rem;
  }
`;

const PlansTrack = styled.div`
  display: flex;
  justify-content: ${({ $singleItem }) => ($singleItem ? 'center' : 'flex-start')};
  gap: 0.8rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const PlanCard = styled.article`
  flex: 0 0 86%;
  min-height: 330px;
  border-radius: 0.9rem;
  border: 1px solid ${({ $recommended }) => ($recommended ? 'rgba(30, 44, 40, 0.35)' : '#d8ddd4')};
  background: #ffffff;
  padding: 0.95rem;
  box-shadow: ${({ $recommended }) => ($recommended ? '0 16px 28px rgba(30, 44, 40, 0.12)' : '0 6px 14px rgba(30, 44, 40, 0.06)')};
  scroll-snap-align: start;
  animation: ${revealUp} 0.5s ease both;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ $recommended }) => ($recommended ? '0 20px 32px rgba(30, 44, 40, 0.16)' : '0 14px 24px rgba(30, 44, 40, 0.12)')};
  }

  @media (min-width: 768px) {
    flex-basis: 44%;
  }

  @media (min-width: 1080px) {
    flex-basis: calc(33.333% - 0.54rem);
  }
`;

const PlanTag = styled.span`
  font-size: 0.75rem;
  color: #516051;
  font-weight: 700;
`;

const PlanText = styled.p`
  margin: 0.45rem 0 0.7rem;
  color: #657364;
  font-size: 0.83rem;
  line-height: 1.4;
`;

const PlanPriceBox = styled.div`
  border-radius: 0.75rem;
  border: 1px solid #d8ddd5;
  background: #fbfcfa;
  padding: 0.7rem;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: end;
  gap: 0.45rem;

  strong {
    color: #141c13;
    font-size: 1.85rem;
    line-height: 1;
  }

  span {
    color: #6c766b;
    font-size: 0.78rem;
    margin-bottom: 0.2rem;
  }
`;

const PlanAction = styled.button`
  width: 100%;
  height: 2.25rem;
  border-radius: 999px;
  border: 1px solid ${({ $recommended }) => ($recommended ? '#111111' : '#d2d8cf')};
  background: ${({ $recommended }) => ($recommended ? 'linear-gradient(125deg, #1d2b27 0%, #2f3f38 100%)' : '#ffffff')};
  color: ${({ $recommended }) => ($recommended ? '#ffffff' : '#1e2c28')};
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: ${({ $recommended }) => ($recommended ? '#1d2b27' : 'rgba(30, 44, 40, 0.28)')};
    box-shadow: 0 8px 16px rgba(25, 36, 32, 0.16);
  }
`;

const PlanFeatureList = styled.ul`
  margin: 0.8rem 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.45rem;

  li {
    color: #566357;
    font-size: 0.79rem;
    line-height: 1.35;
    display: flex;
    align-items: flex-start;
    gap: 0.4rem;
  }

  li::before {
    content: '';
    margin-top: 0.35rem;
    width: 0.38rem;
    height: 0.38rem;
    border-radius: 999px;
    background: #8e988e;
    flex-shrink: 0;
  }
`;

const PlansDots = styled.div`
  margin-top: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
`;

const DotButton = styled.button`
  width: ${({ $active }) => ($active ? '1.35rem' : '0.45rem')};
  height: 0.45rem;
  border-radius: 999px;
  border: none;
  background: ${({ $active }) => ($active ? '#1e2c28' : '#c9cec5')};
  cursor: pointer;
  transition: all 0.18s ease;
`;

const PlansFallbackText = styled.p`
  margin: 0.35rem 0;
  padding: 1rem 0.5rem;
  text-align: center;
  color: #5e695d;
  font-size: 0.9rem;
`;

const Talent = styled.section`
  padding: 1rem;

  @media (min-width: 768px) {
    padding: 0.2rem 2rem 2rem;
  }
`;

const TalentHeading = styled.div`
  margin-bottom: 0.8rem;

  span {
    width: fit-content;
    border-radius: 999px;
    border: 1px solid #d4d9d0;
    color: #4f604f;
    font-size: 0.72rem;
    padding: 0.22rem 0.62rem;
    display: inline-block;
  }

  h2 {
    margin: 0.55rem 0 0;
    font-size: clamp(1.7rem, 5vw, 2.6rem);
    line-height: 1.15;
    color: #121912;
  }
`;

const TalentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.7rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const TalentCard = styled.article`
  border-radius: 1rem;
  min-height: 210px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid ${({ $dark }) => ($dark ? 'rgba(255, 255, 255, 0.08)' : '#d9ddd4')};
  background: ${({ $dark }) => ($dark ? '#1f2521' : '#ffffff')};
  color: ${({ $dark }) => ($dark ? '#eef4ef' : '#1a2118')};
  animation: ${revealUp} 0.56s ease both;
  animation-delay: ${({ $delay }) => $delay || '0s'};
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ $dark }) => ($dark ? '0 16px 28px rgba(12, 18, 15, 0.35)' : '0 14px 24px rgba(30, 44, 40, 0.1)')};
    border-color: ${({ $dark }) => ($dark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(109, 92, 67, 0.24)')};
  }

  h3 {
    margin: 0;
    font-size: 1.7rem;
    line-height: 1.1;
    font-weight: 600;
  }

  p {
    margin: 0.6rem 0 0;
    font-size: 0.86rem;
    line-height: 1.45;
    color: ${({ $dark }) => ($dark ? 'rgba(238, 244, 239, 0.78)' : '#5f6b5f')};
  }
`;

const CtaBand = styled.section`
  margin: 0.3rem 1rem 1rem;
  border-radius: 0.95rem;
  padding: 1rem;
  border: 1px solid rgba(109, 92, 67, 0.2);
  background:
    linear-gradient(100deg, rgba(109, 92, 67, 0.18) 0%, rgba(142, 152, 142, 0.24) 55%, rgba(135, 139, 131, 0.32) 100%);
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(115deg, transparent 0%, rgba(255, 255, 255, 0.38) 42%, transparent 70%);
    background-size: 200% 100%;
    animation: ${shimmerLine} 8s linear infinite;
    pointer-events: none;
  }

  h3 {
    margin: 0;
    color: #182218;
    font-size: 1.2rem;
  }

  p {
    margin: 0.45rem 0 0;
    color: #4f5d4d;
    line-height: 1.45;
  }

  @media (min-width: 768px) {
    margin: 0 2rem 2rem;
    padding: 1.15rem 1.2rem;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const cards = [
  {
    title: 'Agenda inteligente',
    text: 'Mostre horarios disponiveis em tempo real e reduza furos com confirmacao automatica.',
    tone: '#8E988E',
    tag: '/01'
  },
  {
    title: 'Controle financeiro',
    text: 'Acompanhe rendimento por servico e tome decisoes com base em dados simples.',
    tone: '#878B83',
    tag: '/02'
  },
  {
    title: 'Equipe conectada',
    text: 'Centralize operacao, servicos e atendimento em um unico painel de trabalho.',
    tone: '#6D5C43',
    tag: '/03'
  }
];

const talentCards = [
  {
    title: 'Barbearia',
    text: 'Gerencie fila, horarios de pico e recorrencia de clientes sem perder ritmo.',
    dark: false
  },
  {
    title: 'Clinica Estetica',
    text: 'Padrao premium no atendimento com processos claros e notificacoes automatizadas.',
    dark: true
  },
  {
    title: 'Estudio de Tatuagem',
    text: 'Organize briefing, reserva de horario e disponibilidade de artistas em poucos toques.',
    dark: false
  },
  {
    title: 'Consultorio',
    text: 'Visualize agenda por profissional e mantenha comunicacao ativa com cada paciente.',
    dark: false
  }
];

function Landing() {
  const navigate = useNavigate();
  const plansTrackRef = useRef(null);
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [activePlan, setActivePlan] = useState(0);

  useEffect(() => {
    const normalizePlan = (plan, index) => {
      const normalizedFeatures = Array.isArray(plan.features)
        ? plan.features
            .map((feature) => (typeof feature === 'string' ? feature : feature?.name || 'Recurso'))
            .filter(Boolean)
        : [];

      return {
        id: plan.id || plan._id || `${plan.name || 'plano'}-${index}`,
        name: plan.name || `Plano ${index + 1}`,
        monthly: Number(plan.price || plan.monthlyPrice || plan.amount || 0),
        description:
          plan.description ||
          `Plano com ${normalizedFeatures.length || 0} recurso${normalizedFeatures.length === 1 ? '' : 's'} inclusos.`,
        button: `Assinar`,
        recommended: Boolean(plan.recommended || plan.popular || plan.highlighted || plan.isMostPopular),
        features: normalizedFeatures,
      };
    };

    const fetchPlans = async () => {
      setPlansLoading(true);

      try {
        const response = await getPublicSubscriptionPlans();
        const payload = response?.data;
        const sourcePlans = Array.isArray(payload?.plans)
          ? payload.plans
          : Array.isArray(payload)
            ? payload
            : [];

        const mapped = sourcePlans
          .map(normalizePlan)
          .sort((a, b) => a.monthly - b.monthly);

        if (mapped.length > 0 && !mapped.some((plan) => plan.recommended)) {
          const middleIndex = Math.floor(mapped.length / 2);
          mapped[middleIndex] = {
            ...mapped[middleIndex],
            recommended: true,
          };
        }

        setPlans(mapped);
        setActivePlan(0);
      } catch (error) {
        setPlans([]);
      } finally {
        setPlansLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const getScrollStep = () => {
    const track = plansTrackRef.current;
    if (!track) {
      return 0;
    }

    const firstCard = track.querySelector('[data-plan-card="true"]');
    if (!firstCard) {
      return track.clientWidth;
    }

    const styles = window.getComputedStyle(track);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || '0') || 0;

    return firstCard.clientWidth + gap;
  };

  const handlePlanScroll = (event) => {
    const track = event.currentTarget;
    const step = getScrollStep();
    if (!step) {
      return;
    }

    const index = Math.round(track.scrollLeft / step);
    const safeIndex = Math.max(0, Math.min(Math.max(plans.length - 1, 0), index));
    setActivePlan(safeIndex);
  };

  const scrollPlans = (direction) => {
    const track = plansTrackRef.current;
    const step = getScrollStep();
    if (!track || !step) {
      return;
    }

    track.scrollBy({
      left: direction === 'next' ? step : -step,
      behavior: 'smooth'
    });
  };

  const scrollToPlan = (index) => {
    const track = plansTrackRef.current;
    const step = getScrollStep();
    if (!track || !step) {
      return;
    }

    track.scrollTo({
      left: step * index,
      behavior: 'smooth'
    });
  };

  return (
    <Page>
      <Shell>
        <Nav>
          <Brand type="button" onClick={() => navigate('/')}>
            <Logo className='logo' />
          </Brand>
        </Nav>

        <Hero>
          <HeroBadge>14 dias grátis • Sem cartão de crédito</HeroBadge>
          <FloatingGroup aria-hidden="true">
            <span>AN</span>
            <span>BR</span>
            <span>CL</span>
            <span>EX</span>
          </FloatingGroup>

          <HeroTitle>
            Sua plataforma de agendamentos para negocios <strong>modernos</strong>
          </HeroTitle>

          <HeroText>
            Entregue uma experiencia profissional desde o primeiro clique. O Horario Certo conecta atendimento,
            equipe e operacao em uma jornada simples para voce e para seus clientes.
            <br />
            <strong>Teste grátis por 14 dias</strong> — sem necessidade de cartão de crédito.
          </HeroText>

          <HeroCtas>
            <PrimaryButton type="button" onClick={() => navigate('/registro')}>
              Começar gratuitamente agora
            </PrimaryButton>
            <OutlineButton type="button" onClick={() => navigate('/login')}>
              Ja sou cliente
            </OutlineButton>
          </HeroCtas>
        </Hero>

        <Features>
          <FeatureGrid>
            {cards.map((card, index) => (
              <FeatureCard key={card.title} $delay={`${0.08 * index}s`}>
                <Dot $tone={card.tone}>{index + 1}</Dot>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </FeatureCard>
            ))}

            <HighlightCard>
              <span>Destaque</span>
              <h3>Alto desempenho para vender mais e atender melhor.</h3>
              <p>
                Menos atrito, mais conversao: um fluxo de agendamento claro no mobile e no desktop,
                sem complicar a rotina da sua equipe.
              </p>
            </HighlightCard>
          </FeatureGrid>
        </Features>

        <PlansSection>
          <PlansHeader>
            <div>
              <h2>Nossos planos</h2>
              <p style={{ margin: '0.35rem 0 0', color: '#6b7c69', fontSize: '0.9rem' }}>Todos incluem <strong>14 dias grátis</strong> para testar sem compromisso.</p>
            </div>
            <PlansMeta>
              {!plansLoading && plans.length > 1 && 
              <>
                <ControlButton
                    type="button"
                    onClick={() => scrollPlans('prev')}
                    aria-label="Plano anterior"
                    disabled={plansLoading || plans.length === 0 || activePlan === 0}
                >
                    {'<'}
                </ControlButton>
                <ControlButton
                    type="button"
                    onClick={() => scrollPlans('next')}
                    aria-label="Proximo plano"
                    disabled={plansLoading || plans.length === 0 || activePlan >= plans.length - 1}
                >
                    {'>'}
                </ControlButton>
              </>
            }
            </PlansMeta>
          </PlansHeader>

          <PlansCarousel>
            {plansLoading ? (
              <PlansFallbackText>Carregando planos...</PlansFallbackText>
            ) : plans.length === 0 ? (
              <PlansFallbackText>Nenhum plano disponivel no momento.</PlansFallbackText>
            ) : (
              <>
                <PlansTrack
                  ref={plansTrackRef}
                  onScroll={handlePlanScroll}
                  $singleItem={plans.length === 1}
                >
                  {plans.map((plan) => (
                    <PlanCard key={plan.id} data-plan-card="true" $recommended={plan.recommended}>
                      <PlanTag>{plan.name}</PlanTag>
                      <PlanText>{plan.description}</PlanText>

                      <PlanPriceBox>
                        <strong>
                          {Number(plan.monthly || 0).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                            minimumFractionDigits: 2,
                          })}
                        </strong>
                        <span>/ mes</span>
                      </PlanPriceBox>

                      <PlanAction
                        type="button"
                        $recommended={plan.recommended}
                        onClick={() => navigate('/registro')}
                      >
                        {plan.button} — 14 dias grátis
                      </PlanAction>

                      <PlanFeatureList>
                        {plan.features.map((feature) => (
                          <li key={feature}>{feature}</li>
                        ))}
                      </PlanFeatureList>
                    </PlanCard>
                  ))}
                </PlansTrack>

                <PlansDots>
                  {plans.map((plan, index) => (
                    <DotButton
                      key={plan.id}
                      type="button"
                      $active={activePlan === index}
                      onClick={() => scrollToPlan(index)}
                      aria-label={`Ir para plano ${plan.name}`}
                    />
                  ))}
                </PlansDots>
              </>
            )}
          </PlansCarousel>
        </PlansSection>

        <Talent>
          <TalentHeading>
            <span>Segmentos</span>
            <h2>Negócios que crescem com o Horario Certo</h2>
          </TalentHeading>

          <TalentGrid>
            {talentCards.map((item, index) => (
              <TalentCard
                key={item.title}
                $dark={item.dark}
                $delay={`${0.05 * index}s`}
              >
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </TalentCard>
            ))}
          </TalentGrid>
        </Talent>

        <CtaBand>
          <div>
            <h3>Pronto para transformar seus agendamentos?</h3>
            <p><strong>Teste gratuitamente por 14 dias</strong> — explore todos os recursos sem cartão de crédito. Sua equipe merece uma agenda inteligente.</p>
          </div>
          <PrimaryButton type="button" onClick={() => navigate('/registro')}>
            Começar teste gratuito
          </PrimaryButton>
        </CtaBand>
      </Shell>
    </Page>
  );
}

export default Landing;
