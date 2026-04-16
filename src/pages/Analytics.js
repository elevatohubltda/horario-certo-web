import { useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import "../styles/index.css";
import Topbar from "../components/topbar";
import Sidebar from "../components/sidebar";
import { Container } from "../components/container/style";
import { Title } from "../components/title";
import { isAvailableLogin } from "../util/auth";
import { isMobile } from "../util/util";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { Filter, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { getCompanyScheduleViews, getCompanySchedulesAuth } from "../services/endpoints/company";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

/* ─── palette ─── */
const CARD_THEMES = [
  { bg: "#e6ede4", text: "#2a4228", badgeBg: "rgba(255,255,255,0.55)" },
  { bg: "#1e2c28", text: "#ffffff", badgeBg: "rgba(255,255,255,0.15)" },
  { bg: "#f5ede1", text: "#5c3d1e", badgeBg: "rgba(255,255,255,0.55)" },
  { bg: "#e9edf3", text: "#253447", badgeBg: "rgba(255,255,255,0.6)" },
];
const PIE_COLORS = ["#8ca085", "#c4a882", "#5c8070", "#d4b896", "#4a6b45", "#e8c8a8", "#7a9e8c"];

/* ─── animations ─── */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ─── styled components ─── */
const PageWrapper = styled.div`
  animation: ${fadeUp} 0.35s ease both;
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
`;

const Greeting = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const Sub = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-dark);
  opacity: 0.6;
`;

const FilterWrapper = styled.div`position: relative;`;

const FilterBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: #fff;
  color: var(--color-dark);
  border-radius: 999px;
  padding: 0.55rem 1rem;
  font-size: 0.85rem;
  cursor: pointer;
  &:hover { border-color: rgba(0, 0, 0, 0.2); }
`;

const FilterMenu = styled.div`
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 190px;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #fff;
  box-shadow: 0 18px 24px rgba(0, 0, 0, 0.08);
  padding: 0.4rem;
  z-index: 20;
`;

const FilterOpt = styled.button`
  width: 100%;
  border: none;
  text-align: left;
  border-radius: 10px;
  padding: 0.5rem 0.75rem;
  font-size: 0.88rem;
  cursor: pointer;
  background: ${({ $active }) => ($active ? "rgba(142,152,142,0.18)" : "transparent")};
  color: var(--color-dark);
  &:hover { background: rgba(142, 152, 142, 0.12); }
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  width: 100%;
  margin-top: 1.5rem;
  @media (max-width: 1200px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @media (max-width: 960px) { grid-template-columns: 1fr; }
`;

const Card = styled.div`
  background: ${({ $bg }) => $bg};
  border-radius: 24px;
  padding: 1.4rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  animation: ${fadeUp} 0.4s ease both;
  animation-delay: ${({ $i }) => $i * 0.08}s;
`;

const CardTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardLabel = styled.span`
  font-size: 0.85rem;
  font-weight: 500;
  color: ${({ $color }) => $color};
  opacity: 0.75;
`;

const PctBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
`;

const CardValue = styled.span`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ $color }) => $color};
  line-height: 1.1;
`;

const CardSub = styled.span`
  font-size: 0.78rem;
  color: ${({ $color }) => $color};
  opacity: 0.6;
`;

const Sparkline = styled.div`
  height: 40px;
  width: 100%;
  margin-top: 0.25rem;
  opacity: 0.6;
`;

const ChartsRow = styled.div`
  display: grid;
  grid-template-columns: ${({ $hasPie }) => ($hasPie ? "1.6fr 1fr" : "1fr")};
  gap: 1rem;
  margin-top: 1.25rem;
  @media (max-width: 960px) { grid-template-columns: 1fr; }
`;

const ChartCard = styled.div`
  background: #fff;
  border-radius: 24px;
  padding: 1.5rem;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.04);
  animation: ${fadeUp} 0.45s ease both;
  animation-delay: 0.28s;
`;

const ChartTitle = styled.p`
  margin: 0 0 1.25rem 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-dark);
`;

const EmptyChart = styled.div`
  background: #f9f9fb;
  border-radius: 14px;
  padding: 1.25rem;
  font-size: 0.88rem;
  color: rgba(30, 44, 40, 0.5);
  text-align: center;
`;

/* ─── pure helpers ─── */
const fmt = (d) => {
  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const dy = String(d.getDate()).padStart(2, "0");
  return `${yr}-${mo}-${dy}`;
};

const getDays = (period) => {
  if (period === "últimos 15 dias") return 15;
  if (period === "últimos 30 dias") return 30;
  return 7;
};

const currentRange = (period) => {
  const days = getDays(period);
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  return { startDate: fmt(start), endDate: fmt(end) };
};

const previousRange = (period) => {
  const days = getDays(period);
  const end = new Date();
  end.setDate(end.getDate() - days);
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));
  return { startDate: fmt(start), endDate: fmt(end) };
};

const calcPct = (curr, prev) => {
  if (prev === 0 && curr === 0) return null;
  if (prev === 0) return 100;
  return Math.round(((curr - prev) / prev) * 100);
};

const parseAmount = (value) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const normalized = value.replace(/\./g, "").replace(",", ".").replace(/[^0-9.-]/g, "");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const sumBookedRevenue = (schedules = []) => {
  return schedules.reduce((acc, schedule) => {
    if (schedule?.available !== false) return acc;
    const amount = parseAmount(schedule?.service?.amount ?? schedule?.serviceAmount ?? 0);
    return acc + amount;
  }, 0);
};

const formatCurrency = (value) => {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

/* mini SVG sparkline */
const SparkSVG = ({ data, color }) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const W = 200, H = 36;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - (v / max) * H;
    return `${x},${y}`;
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="none">
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/* custom bar tooltip */
const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#1e2c28", color: "#fff",
      borderRadius: 12, padding: "0.5rem 0.85rem", fontSize: "0.82rem",
    }}>
      <div style={{ marginBottom: 2, opacity: 0.7 }}>{label}</div>
      <strong>{payload[0].value} agendamento{payload[0].value !== 1 ? "s" : ""}</strong>
    </div>
  );
};

/* ─── component ─── */
export default function Analytics() {
  const PERIODS = ["últimos 7 dias", "últimos 15 dias", "últimos 30 dias"];
  const navigate = useNavigate();
  const companyUrl = Cookies.get("companyUrl");
  const filterRef = useRef(null);

  const [companyInfo] = useState(
    Cookies.get("companyInfo") ? JSON.parse(Cookies.get("companyInfo")) : undefined
  );
  const [mobile, setMobile] = useState();
  const [period, setPeriod] = useState("últimos 7 dias");
  const [openMenu, setOpenMenu] = useState(false);
  const [loading, setLoading] = useState(true);

  const [currBooked, setCurrBooked] = useState(0);
  const [currVacant, setCurrVacant] = useState(0);
  const [currViews, setCurrViews] = useState(0);
  const [currRevenue, setCurrRevenue] = useState(0);
  const [prevBooked, setPrevBooked] = useState(0);
  const [prevVacant, setPrevVacant] = useState(0);
  const [prevViews, setPrevViews] = useState(0);
  const [prevRevenue, setPrevRevenue] = useState(0);
  const [dailyData, setDailyData] = useState([]);
  const [serviceData, setServiceData] = useState([]);

  const buildDailyData = (schedules, startDateStr, days) => {
    const [y, mo, dy] = startDateStr.split("-").map(Number);
    const startJs = new Date(y, mo - 1, dy);
    const map = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(startJs);
      d.setDate(d.getDate() + i);
      const key = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
      map[key] = 0;
    }
    schedules.forEach((s) => {
      if (s.available === false && s.schedule) {
        const d = new Date(s.schedule);
        if (!isNaN(d.getTime())) {
          const key = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
          if (key in map) map[key]++;
        }
      }
    });
    return Object.entries(map).map(([date, total]) => ({ date, total }));
  };

  const buildServiceData = (schedules) => {
    const map = {};
    schedules.forEach((s) => {
      if (s.available === false && s.service?.name) {
        map[s.service.name] = (map[s.service.name] || 0) + 1;
      }
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const fetchAll = async () => {
    if (!companyUrl) return;
    setLoading(true);
    const curr = currentRange(period);
    const prev = previousRange(period);
    const days = getDays(period);

    const [currSched, prevSched, currV, prevV] = await Promise.allSettled([
      getCompanySchedulesAuth(companyUrl, curr.startDate, curr.endDate),
      getCompanySchedulesAuth(companyUrl, prev.startDate, prev.endDate),
      getCompanyScheduleViews(companyUrl, curr.startDate, curr.endDate),
      getCompanyScheduleViews(companyUrl, prev.startDate, prev.endDate),
    ]);

    const cs = currSched.status === "fulfilled" ? (currSched.value?.data || []) : [];
    const ps = prevSched.status === "fulfilled" ? (prevSched.value?.data || []) : [];

    setCurrBooked(cs.filter((s) => s.available === false).length);
    setCurrVacant(cs.filter((s) => s.available === true).length);
    setCurrViews(currV.status === "fulfilled" ? (currV.value?.data?.totalViews ?? 0) : 0);
    setCurrRevenue(sumBookedRevenue(cs));
    setPrevBooked(ps.filter((s) => s.available === false).length);
    setPrevVacant(ps.filter((s) => s.available === true).length);
    setPrevViews(prevV.status === "fulfilled" ? (prevV.value?.data?.totalViews ?? 0) : 0);
    setPrevRevenue(sumBookedRevenue(ps));

    setDailyData(buildDailyData(cs, curr.startDate, days));
    setServiceData(buildServiceData(cs));
    setLoading(false);
  };

  useEffect(() => {
    if (isAvailableLogin()) {
      setMobile(isMobile());
    } else {
      navigate("/" + companyUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyUrl, navigate]);

  useEffect(() => {
    if (isAvailableLogin()) fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, companyUrl]);

  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setOpenMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const makeBadge = (curr, prev) => {
    const pct = calcPct(curr, prev);
    if (pct === null) return { label: "—", color: "#888", bg: "rgba(0,0,0,0.06)", icon: <Minus size={12} /> };
    if (pct > 0) return { label: `+${pct}%`, color: "#1a7a3a", bg: "rgba(34,197,94,0.15)", icon: <TrendingUp size={12} /> };
    if (pct < 0) return { label: `${pct}%`, color: "#b91c1c", bg: "rgba(239,68,68,0.15)", icon: <TrendingDown size={12} /> };
    return { label: "0%", color: "#888", bg: "rgba(0,0,0,0.06)", icon: <Minus size={12} /> };
  };

  const days = getDays(period);
  const hasPie = serviceData.length > 0;

  const metrics = [
    {
      label: "Visualizações da agenda",
      value: currViews,
      badge: makeBadge(currViews, prevViews),
      spark: null,
      theme: CARD_THEMES[0],
    },
    {
      label: "Agendamentos realizados",
      value: currBooked,
      badge: makeBadge(currBooked, prevBooked),
      spark: dailyData.map((d) => d.total),
      theme: CARD_THEMES[1],
    },
    {
      label: "Horários não agendados",
      value: currVacant,
      badge: makeBadge(currVacant, prevVacant),
      spark: null,
      theme: CARD_THEMES[2],
    },
    {
      label: "Valor dos agendamentos",
      value: currRevenue,
      displayValue: formatCurrency(currRevenue),
      badge: makeBadge(currRevenue, prevRevenue),
      spark: null,
      theme: CARD_THEMES[3],
    },
  ];

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
                $padding="0 0 3rem 0"
                $display="flex"
                $flexdirection="column"
                $backgroundcolor="transparent"
                $boxshadow="none"
              >
                <PageWrapper>
                  {/* header */}
                  <Header>
                    <Greeting>
                      <Title $fontsize="2rem">Análise de Desempenho</Title>
                      <Sub>
                        Comparado ao mesmo período anterior · {loading ? "carregando..." : `${days} dias`}
                      </Sub>
                    </Greeting>
                    <FilterWrapper ref={filterRef}>
                      <FilterBtn type="button" onClick={() => setOpenMenu((p) => !p)}>
                        <Filter size={15} />
                        {period}
                      </FilterBtn>
                      {openMenu && (
                        <FilterMenu>
                          {PERIODS.map((opt) => (
                            <FilterOpt
                              key={opt}
                              type="button"
                              $active={period === opt}
                              onClick={() => { setPeriod(opt); setOpenMenu(false); }}
                            >
                              {opt}
                            </FilterOpt>
                          ))}
                        </FilterMenu>
                      )}
                    </FilterWrapper>
                  </Header>

                  {/* metric cards */}
                  <CardsGrid>
                    {metrics.map((m, i) => (
                      <Card key={m.label} $bg={m.theme.bg} $i={i}>
                        <CardTop>
                          <CardLabel $color={m.theme.text}>{m.label}</CardLabel>
                          <PctBadge $bg={m.theme.badgeBg} $color={m.badge.color}>
                            {m.badge.icon}
                            {m.badge.label}
                          </PctBadge>
                        </CardTop>
                        <CardValue $color={m.theme.text}>
                          {loading ? "—" : (m.displayValue ?? m.value)}
                        </CardValue>
                        {m.spark && !loading && (
                          <Sparkline>
                            <SparkSVG data={m.spark} color={m.theme.text} />
                          </Sparkline>
                        )}
                        <CardSub $color={m.theme.text}>
                          nos últimos {days} dias
                        </CardSub>
                      </Card>
                    ))}
                  </CardsGrid>

                  {/* charts */}
                  <ChartsRow $hasPie={hasPie}>
                    {/* bar chart: agendamentos por dia */}
                    <ChartCard>
                      <ChartTitle>Agendamentos realizados por dia</ChartTitle>
                      {loading ? (
                        <EmptyChart>Carregando...</EmptyChart>
                      ) : dailyData.every((d) => d.total === 0) ? (
                        <EmptyChart>Nenhum agendamento realizado neste período.</EmptyChart>
                      ) : (
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={dailyData} barSize={days <= 7 ? 28 : 14}>
                            <XAxis
                              dataKey="date"
                              tick={{ fontSize: 11, fill: "rgba(30,44,40,0.55)" }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis
                              allowDecimals={false}
                              tick={{ fontSize: 11, fill: "rgba(30,44,40,0.4)" }}
                              axisLine={false}
                              tickLine={false}
                              width={24}
                            />
                            <Tooltip
                              content={<BarTooltip />}
                              cursor={{ fill: "rgba(140,160,133,0.1)", radius: 8 }}
                            />
                            <Bar dataKey="total" fill="#1e2c28" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </ChartCard>

                    {/* donut chart: agendamentos por serviço */}
                    {hasPie && (
                      <ChartCard>
                        <ChartTitle>Agendamentos por serviço</ChartTitle>
                        <ResponsiveContainer width="100%" height={220}>
                          <PieChart>
                            <Pie
                              data={serviceData}
                              cx="50%"
                              cy="50%"
                              innerRadius={55}
                              outerRadius={85}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {serviceData.map((_, idx) => (
                                <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(v, n) => [`${v} agendamento${v !== 1 ? "s" : ""}`, n]}
                              contentStyle={{
                                borderRadius: 12,
                                border: "none",
                                boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
                                fontSize: 13,
                              }}
                            />
                            <Legend
                              iconType="circle"
                              iconSize={9}
                              formatter={(value) => (
                                <span style={{ fontSize: "0.8rem", color: "var(--color-dark)" }}>
                                  {value}
                                </span>
                              )}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartCard>
                    )}
                  </ChartsRow>
                </PageWrapper>
              </Container>
            </Sidebar>
          </Container>
        </>
      )}
    </>
  );
}
