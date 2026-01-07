import React, { useEffect, useState } from "react"
import styled from "styled-components"
import { Home, Settings, PanelLeftClose, PanelLeftOpen, KeyRound, CalendarDays } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { isMobile } from "../../util/util"

const SidebarContainer = styled.div`
  width: ${(props) => (props.$isOpen ? "200px" : "50px")};
  height: calc(100vh - 60px);
  background-color: var(--color-background);
  color: var(--color-dark);
  transition: width 0.3s ease;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--color-olive);
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: var(--color-sage);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  &:hover {
    color: var(--color-dark);
  }
`;

const Label = styled.span`
  margin-left: 12px;
  display: ${(props) => (props.$isVisible ? "inline" : "none")};
  font-weight: ${(props) => (props.$isActive ? "600" : "400")};
`;

const MenuList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
`;

const MenuItem = styled.li`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
  width: ${(props) => (props.$isOpen ? "calc(200px - 34px)" : "calc(50px - 34px)")};
  font-size: ${(props) => (props.$isActive ? "14px" : "12px")};
  color: ${(props) =>
    props.$isActive ? "var(--color-dark)" : "var(--color-sage)"};
  background-color: ${(props) =>
    props.$isActive ? "rgba(142, 152, 142, 0.15)" : "transparent"};
  border-left: ${(props) =>
    props.$isActive ? "3px solid var(--color-sage)" : "3px solid transparent"};

  svg {
    color: inherit;
  }

  &:hover {
    background-color: rgba(142, 152, 142, 0.2);
    color: var(--color-dark);
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 2rem;
  padding-top: 0;
  overflow-y: auto;
`;

const Layout = styled.div`
  display: flex;
  height: calc(100vh - 60px);
  width: 100%;
`

const Sidebar = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true)
  const [mobile, setMobile] = useState();
  const location = useLocation();
  const currentPage = location.pathname.split('/').filter(Boolean)[0];
  const navigate = useNavigate();

  const menuItems = [
    { icon: <Home size={currentPage === 'dashboard' ? 16 : 14} />, label: "Dashboard", url: "/dashboard" },
    //{ icon: <User size={currentPage === 'clientes' ? 16 : 14} />, label: "Clientes", url: "/clientes" },
    { icon: <CalendarDays size={currentPage === 'meus-agendamentos' ? 16 : 14} />, label: "Criar agendamentos", url: "/criar-agendamentos" },
    //{ icon: <DollarSignIcon size={currentPage === 'plano' ? 16 : 14} />, label: "Meu plano", url: "/plano" },
    { icon: <Settings size={currentPage === 'configuracoes' ? 16 : 14} />, label: "Configurações", url: "/configuracoes" },
    { icon: <KeyRound size={currentPage === 'alterar-senha' ? 16 : 14} />, label: "Alterar senha", url: "/alterar-senha" },
  ]

  useEffect(() => {
    setMobile(isMobile());  
  },  []);

  if (mobile) return <>{children}</>;
  return (
    <Layout>
      <SidebarContainer $isOpen={isOpen}>

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
        
        <ToggleButton onClick={() => setIsOpen((prev) => !prev)}>
          {isOpen && 
            <>
              <PanelLeftClose size={14} />
              <Label $isVisible={isOpen}>Esconder</Label>
            </>
          }
          {!isOpen &&
            <PanelLeftOpen size={14} />
          }
        </ToggleButton>
      </SidebarContainer>

      <Content>{children}</Content>
    </Layout>
  )
}

export default Sidebar
