import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { CalendarDays, LogOut } from "lucide-react";
import { ReactComponent as Logo } from "../../assets/horario-certo-logo-horizontal.svg?component";
import { logoutCurrentCustomer } from "../../util/customerSession";

const Page = styled.div`
  min-height: 100vh;
  background: var(--ui-page-bg);
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  background: #fff;
  border-bottom: 1px solid var(--ui-border);
`;

const HeaderInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: min(1040px, 100%);
  height: 60px;
  margin: 0 auto;
  padding: 0 1rem;
  box-sizing: border-box;
`;

const Brand = styled.button`
  display: flex;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;

  svg {
    height: 36px;
    width: auto;
  }
`;

const UserArea = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--ui-text-secondary);

  .name {
    font-weight: 600;
    max-width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (max-width: 520px) {
    .name {
      display: none;
    }
  }
`;

const HeaderButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  height: 34px;
  padding: 0 0.85rem;
  border-radius: 999px;
  border: 1px solid var(--ui-input-border);
  background: #fff;
  color: var(--ui-text);
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #f3f4f6;
  }
`;

export const Content = styled.main`
  width: min(1040px, 100%);
  margin: 0 auto;
  padding: 1.5rem 1rem 3rem;
  box-sizing: border-box;
`;

// Estrutura das telas do cliente final: topo com a marca e a conta, conteúdo centralizado
export default function CustomerLayout({ customer, children }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutCurrentCustomer();
    navigate("/area-do-cliente/entrar");
  };

  return (
    <Page>
      <Header>
        <HeaderInner>
          <Brand type="button" onClick={() => navigate(customer ? "/area-do-cliente" : "/")} aria-label="Horário Certo">
            <Logo />
          </Brand>
          {customer && (
            <UserArea>
              <span className="name">{customer.name}</span>
              <HeaderButton type="button" onClick={() => navigate("/area-do-cliente")}>
                <CalendarDays size={14} /> Agendamentos
              </HeaderButton>
              <HeaderButton type="button" onClick={handleLogout} aria-label="Sair">
                <LogOut size={14} /> Sair
              </HeaderButton>
            </UserArea>
          )}
        </HeaderInner>
      </Header>
      {children}
    </Page>
  );
}
