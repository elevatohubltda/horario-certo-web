import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { CalendarX2 } from "lucide-react";
import logo from "../assets/horario-certo-logo-horizontal.svg";

const Page = styled.main`
  min-height: 100dvh;
  background: var(--ui-page-bg);
  font-family: var(--ui-font);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 16px;
  box-sizing: border-box;
`;

const Logo = styled.img`
  height: 36px;
  cursor: pointer;
`;

const Content = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  max-width: 480px;
  width: 100%;
`;

const IconCircle = styled.div`
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: var(--ui-accent-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

const Code = styled.div`
  font-size: 4.5rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.04em;
  color: var(--ui-primary);
  margin-bottom: 12px;
`;

const Title = styled.h1`
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--ui-text);
  margin: 0 0 10px;
`;

const Text = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: var(--ui-muted);
  margin: 0 0 28px;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
`;

const Btn = styled.button`
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: var(--ui-radius-sm);
  padding: 12px 24px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  border: 1px solid var(--ui-primary);
  background: ${(p) => (p.$secondary ? "transparent" : "var(--ui-primary)")};
  color: ${(p) => (p.$secondary ? "var(--ui-primary)" : "#fff")};

  &:hover {
    background: ${(p) => (p.$secondary ? "var(--ui-accent-soft)" : "var(--ui-primary-hover)")};
  }
`;

const COPY = {
  page: {
    title: "Página não encontrada",
    text: "O endereço que você tentou acessar não existe ou foi alterado. Confira o link ou volte para o início.",
  },
  company: {
    title: "Agenda não encontrada",
    text: "Não encontramos nenhum estabelecimento com este link. Confira o endereço com o prestador de serviços que enviou o link para você.",
  },
};

// Tela de 404: rota que não existe ou link de agenda de empresa inexistente
export default function NotFound({ variant = "page" }) {
  const navigate = useNavigate();
  const copy = COPY[variant] || COPY.page;

  useEffect(() => {
    const previous = document.title;
    document.title = `${copy.title} | Horário Certo`;
    return () => { document.title = previous; };
  }, [copy.title]);

  const canGoBack = typeof window !== "undefined" && window.history.length > 1;

  return (
    <Page>
      <Logo src={logo} alt="Horário Certo" onClick={() => navigate("/")} />
      <Content>
        <IconCircle>
          <CalendarX2 size={40} color="var(--ui-primary)" aria-hidden="true" />
        </IconCircle>
        <Code aria-hidden="true">404</Code>
        <Title>{copy.title}</Title>
        <Text>{copy.text}</Text>
        <Actions>
          <Btn type="button" onClick={() => navigate("/")}>Ir para o início</Btn>
          {canGoBack && (
            <Btn type="button" $secondary onClick={() => navigate(-1)}>Voltar</Btn>
          )}
        </Actions>
      </Content>
    </Page>
  );
}
