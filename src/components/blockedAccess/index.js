import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Lock } from "lucide-react";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 40px 24px;
  text-align: center;
`;

const IconWrapper = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #fef2f2;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 12px;
`;

const Message = styled.p`
  font-size: 1rem;
  color: #6b7280;
  max-width: 480px;
  line-height: 1.6;
  margin: 0 0 32px;
`;

const ActionButton = styled.button`
  background: #16a34a;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px 28px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #15803d;
  }
`;

export default function BlockedAccessPage({ variant = "public" }) {
  const navigate = useNavigate();

  const isOwner = variant === "owner";

  return (
    <Wrapper>
      <IconWrapper>
        <Lock size={32} color="#dc2626" />
      </IconWrapper>

      <Title>
        {isOwner ? "Acesso bloqueado" : "Página temporariamente indisponível"}
      </Title>

      <Message>
        {isOwner
          ? "O acesso à sua agenda foi bloqueado por falta de pagamento. Para regularizar, acesse a página de Assinatura e pague a fatura em aberto."
          : "Esta página está temporariamente indisponível. Por favor, tente novamente mais tarde."}
      </Message>

      {isOwner && (
        <ActionButton onClick={() => navigate("/assinatura")}>
          Ir para Assinatura
        </ActionButton>
      )}
    </Wrapper>
  );
}
