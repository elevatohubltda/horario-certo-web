import React, { useEffect, useState } from "react"
import styled from "styled-components"
import { Home, Settings, KeyRound, CalendarDays, Banknote, Scissors, BarChart2, FileText, Bell, BellRing, ListOrdered, HelpCircle, Megaphone, Clock, CalendarClock, MessageCircle, Users, Layers, TicketPercent, UserCog } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { isMobile } from "../../util/util"
import { isMobileApp } from "../../services/api"
import { getCompanyProperties } from "../../services/endpoints/company"
import { fetchMaxProfessionals } from "../../services/endpoints/professional"
import { isAdmin, isProfessional } from "../../util/auth"
import Cookies from "js-cookie"

export const ADMIN_MENU_ITEMS = [
  { label: "Clientes", url: "/admin/clientes", icon: Users },
  { label: "Planos", url: "/admin/planos", icon: Layers },
  { label: "Cupons de desconto", url: "/admin/cupons", icon: TicketPercent },
  { label: "Uso WhatsApp", url: "/admin/whatsapp", icon: MessageCircle },
  { label: "Alterar senha", url: "/alterar-senha", icon: KeyRound },
  { label: "Ajuda", url: "/ajuda", icon: HelpCircle },
]

// Menu do profissional da equipe: "Agendamentos" leva à agenda do modo de agenda da empresa
export const professionalMenuItems = (scheduleMode) => [
  { label: "Dashboard", url: "/dashboard", icon: Home },
  scheduleMode === "SIMPLES"
    ? { label: "Agendamentos", url: "/agenda-semanal", icon: CalendarClock }
    : { label: "Agendamentos", url: "/agendamentos", icon: CalendarDays },
  { label: "Serviços", url: "/servicos", icon: Scissors },
  { label: "Lista de Espera", url: "/lista-de-espera", icon: ListOrdered },
  { label: "Divulgação", url: "/divulgacao", icon: Megaphone },
  { label: "Alterar senha", url: "/alterar-senha", icon: KeyRound },
  { label: "Ajuda", url: "/ajuda", icon: HelpCircle },
]

const hasWhatsAppFeature = (feature) =>
  feature.name.toLowerCase().includes("whatsapp")

const SidebarContainer = styled.div`
  width: ${(props) => (props.$isOpen ? "220px" : "70px")};
  height: 100%;
  color: var(--ui-text);
  transition: width 0.5s ease;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  overflow: hidden;
`;

const Label = styled.span`
  display: ${(props) => (props.$isVisible ? "inline" : "none")};
  font-weight: ${(props) => (props.$isActive ? "600" : "500")};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MenuList = styled.ul`
  list-style: none;
  padding: 8px 0;
  margin: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
`;

const MenuItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.$isOpen ? "flex-start" : "center")};
  gap: 10px;
  padding: 10px;
  margin: 4px 6px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: ${(props) => (props.$isActive ? "13px" : "12px")};
  color: ${(props) =>
    props.$isActive ? "#fff" : "var(--ui-text)"};
  background-color: ${(props) =>
    props.$isActive ? "var(--ui-primary)" : "transparent"};
  border-left: none;

  svg {
    color: inherit;
    flex-shrink: 0;
  }

  &:hover {
    background-color: ${(props) =>
      props.$isActive ? "var(--ui-primary)" : "#f3f4f6"};
    color: ${(props) => (props.$isActive ? "#fff" : "var(--ui-text)")};
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 2rem;
  padding-top: 0;
  max-width: 100%;
  box-sizing: border-box;
`;

const Layout = styled.div`
  display: flex;
  height: calc(100vh - 80px);
  width: 100%;
`;

const Sidebar = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [mobile, setMobile] = useState();
  const [hasWhatsApp, setHasWhatsApp] = useState(false);
  const [scheduleMode, setScheduleMode] = useState("PADRAO");
  const [maxProfessionals, setMaxProfessionals] = useState(1);
  const location = useLocation();
  const currentPath = location.pathname.toLowerCase().replace(/\/+$/, "");
  const navigate = useNavigate();
  const admin = isAdmin();
  const professional = isProfessional();

  const baseMenuItems = [
    { icon: <Home size={18} />, label: "Dashboard", url: "/dashboard" },
    ...(scheduleMode !== "SIMPLES" ? [{ icon: <CalendarDays size={18} />, label: "Agendamentos", url: "/agendamentos" }] : []),
    ...(scheduleMode === "SIMPLES" ? [
      { icon: <Clock size={18} />, label: "Configuração Horários", url: "/configurar-horario-semanal" },
      { icon: <CalendarClock size={18} />, label: "Agenda semanal", url: "/agenda-semanal" },
    ] : []),
    { icon: <BarChart2 size={18} />, label: "Análise", url: "/analytics" },
    { icon: <FileText size={18} />, label: "Relatórios", url: "/relatorios" },
    { icon: <Scissors size={18} />, label: "Serviços", url: "/servicos" },
    { icon: <ListOrdered size={18} />, label: "Lista de Espera", url: "/lista-de-espera" },
    { icon: <Banknote size={18} />, label: "Assinatura", url: "/assinatura" },
    { icon: <Settings size={18} />, label: "Configurações", url: "/configuracoes" },
    { icon: <KeyRound size={18} />, label: "Alterar senha", url: "/alterar-senha" },
    { icon: <Megaphone size={18} />, label: "Divulgação", url: "/divulgacao" },
    { icon: <HelpCircle size={18} />, label: "Ajuda", url: "/ajuda" },
  ]

  const baseCount = scheduleMode !== "SIMPLES" ? 7 : 6;

  const extraItems = [
    ...(maxProfessionals > 1 ? [{ icon: <UserCog size={18} />, label: "Profissionais", url: "/profissionais" }] : []),
    ...(hasWhatsApp ? [{ icon: <Bell size={18} />, label: "Notificações", url: "/notificacoes" }] : []),
    ...(isMobileApp() ? [{ icon: <BellRing size={18} />, label: "Notificações Push", url: "/notificacoes-push" }] : []),
  ];

  const withIcons = (items) => items.map(({ icon: Icon, ...item }) => ({ ...item, icon: <Icon size={18} /> }));
  const menuItems = admin
    ? withIcons(ADMIN_MENU_ITEMS)
    : professional
    ? withIcons(professionalMenuItems(scheduleMode))
    : [
        ...baseMenuItems.slice(0, baseCount),
        ...extraItems,
        ...baseMenuItems.slice(baseCount),
      ];

  useEffect(() => {
    setMobile(isMobile());
    if (isAdmin()) return;
    try {
      const stored = Cookies.get("companyFeatures");
      if (stored) {
        const features = JSON.parse(stored);
        setHasWhatsApp(features.some(hasWhatsAppFeature));
      }
    } catch {}
    const companyUrl = Cookies.get("companyUrl");
    if (companyUrl) {
      getCompanyProperties(companyUrl)
        .then((response) => setScheduleMode(response.data?.scheduleMode || "PADRAO"))
        .catch(() => {});
      // Gestão de profissionais é só do dono
      if (!isProfessional()) fetchMaxProfessionals(companyUrl).then(setMaxProfessionals);
    }
  }, []);

  if (mobile) return <>{children}</>;
  return (
    <Layout>
      <SidebarContainer 
        $isOpen={isOpen}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <MenuList>
          {menuItems.map((item, index) => {
            const isActive = currentPath === item.url.toLowerCase();
            return (
              <MenuItem
                key={index}
                $isOpen={isOpen}
                $isActive={isActive}
                onClick={() => navigate(item.url)}
              >
                {item.icon}
                <Label $isVisible={isOpen} $isActive={isActive}>{item.label}</Label>
              </MenuItem>
            );
          })}
        </MenuList>
      </SidebarContainer>

      <Content>{children}</Content>
    </Layout>
  )
}

export default Sidebar
