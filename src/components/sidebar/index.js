import React, { useEffect, useState } from "react"
import styled from "styled-components"
import { Home, User, Settings, PanelLeftClose, PanelLeftOpen, DollarSignIcon } from "lucide-react"
import { useLocation } from "react-router-dom"
import { isMobile } from "../../util/util"

const SidebarContainer = styled.div`
  width: ${(props) => (props.$isOpen ? "200px" : "50px")};
  height: calc(100vh - 60px);
  background-color: #6a5acd0a;
  color: #6A5ACD;
  transition: width 0.3s ease;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  box-shadow: 0px +6px 6px 0px rgba(0, 0, 0, 0.1);
`

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: #6A5ACD;
  padding: 1rem;
  display: flex;
  align-items: center;
  cursor: pointer;
`

const Label = styled.span`
  margin-left: 12px;
  display: ${(props) => (props.$isVisible ? "inline" : "none")};
  border-bottom: ${(props) => (props.$isActive ? "solid" : "none")};
  border-bottom-width: ${(props) => (props.$isActive ? "1px" : "0")};
`

const MenuList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1rem 0;
  margin-top: 0;
  flex: 1;
`

const MenuItem = styled.li`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: 0.3s;
  width: ${(props) => (props.$isOpen ? "calc(200px - 32px)" : "calc(50px - 32px)")};
  font-size: ${(props) => (props.$isActive ? "14px" : "12px")};
  color: ${(props) => (props.$isActive ? "#8f85cc" : "#6A5ACD")};

  &:hover {
    background-color: #6A5ACD;
    color: white;
  }
`

const Content = styled.div`
  flex: 1;
  padding: 2rem;
  padding-top: 0;
  overflow-y: auto;
`

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

  const menuItems = [
    { icon: <Home size={currentPage === 'dashboard' ? 18 : 14} />, label: "Dashboard" },
    { icon: <User size={currentPage === 'clientes' ? 18 : 14} />, label: "Clientes" },
    { icon: <DollarSignIcon size={currentPage === 'plano' ? 18 : 14} />, label: "Meu plano" },
    { icon: <Settings size={currentPage === 'configuracoes' ? 18 : 14} />, label: "Configurações" },
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
            <MenuItem key={index} $isOpen={isOpen} $isActive={currentPage === item.label.toLowerCase()}>
              {item.icon}
              <Label $isVisible={isOpen} $isActive={currentPage === item.label.toLowerCase()}>{item.label}</Label>
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
