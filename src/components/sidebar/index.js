import React, { useEffect, useState } from "react"
import styled from "styled-components"
import { Home, Settings, KeyRound, CalendarDays, Banknote, Scissors, BarChart2, FileText, Bell, BellRing, ListOrdered } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { isMobile } from "../../util/util"
import { isMobileApp } from "../../services/api"
import Cookies from "js-cookie"

const hasWhatsAppFeature = (feature) =>
  feature.name.toLowerCase().includes("whatsapp")

const SidebarContainer = styled.div`
  width: ${(props) => (props.$isOpen ? "220px" : "70px")};
  height: 100%;
  color: var(--color-dark);
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
    props.$isActive ? "#fff" : "var(--color-dark)"};
  background-color: ${(props) =>
    props.$isActive ? "var(--color-sage)" : "transparent"};
  border-left: none;

  svg {
    color: inherit;
    flex-shrink: 0;
  }

  &:hover {
    background-color: ${(props) =>
      props.$isActive ? "var(--color-sage)" : "rgba(142, 152, 142, 0.15)"};
    color: ${(props) => (props.$isActive ? "#fff" : "var(--color-dark)")};
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
  const location = useLocation();
  const currentPage = location.pathname.split('/').filter(Boolean)[0];
  const navigate = useNavigate();

  const baseMenuItems = [
    { icon: <Home size={18} />, label: "Dashboard", url: "/dashboard" },
    { icon: <CalendarDays size={18} />, label: "Agendamentos", url: "/agendamentos" },
    { icon: <BarChart2 size={18} />, label: "Análise", url: "/analytics" },
    { icon: <FileText size={18} />, label: "Relatórios", url: "/relatorios" },
    { icon: <Scissors size={18} />, label: "Serviços", url: "/servicos" },
    { icon: <ListOrdered size={18} />, label: "Lista de Espera", url: "/lista-de-espera" },
    { icon: <Banknote size={18} />, label: "Assinatura", url: "/assinatura" },
    { icon: <Settings size={18} />, label: "Configurações", url: "/configuracoes" },
    { icon: <KeyRound size={18} />, label: "Alterar senha", url: "/alterar-senha" },
  ]

  const extraItems = [
    ...(hasWhatsApp ? [{ icon: <Bell size={18} />, label: "Notificações", url: "/notificacoes" }] : []),
    ...(isMobileApp() ? [{ icon: <BellRing size={18} />, label: "Notificações Push", url: "/notificacoes-push" }] : []),
  ];

  const menuItems = [
    ...baseMenuItems.slice(0, 7),
    ...extraItems,
    ...baseMenuItems.slice(7),
  ];

  useEffect(() => {
    setMobile(isMobile());
    try {
      const stored = Cookies.get("companyFeatures");
      if (stored) {
        const features = JSON.parse(stored);
        setHasWhatsApp(features.some(hasWhatsAppFeature));
      }
    } catch {}
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
          {menuItems.map((item, index) => (
            <MenuItem 
              key={index}
              $isOpen={isOpen}
              $isActive={currentPage === item.url.toLowerCase().replace('/', '')}
              onClick={() => navigate(item.url)}
            >
              {item.icon}
              <Label $isVisible={isOpen} $isActive={currentPage === item.url.toLowerCase().replace('/', '')}>{item.label}</Label>
            </MenuItem>
          ))}
        </MenuList>
      </SidebarContainer>

      <Content>{children}</Content>
    </Layout>
  )
}

export default Sidebar
