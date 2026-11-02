import React, { useState } from "react";
import styled from "styled-components";
import { ArrowRight, CalendarCheck, RefreshCw, XCircle } from "lucide-react";
import { Modal } from "../admin";
import CustomerAuthForm from "./CustomerAuthForm";
import { chooseGuest } from "../../util/customerSession";

// Opção principal: agendar direto, sem criar conta
const GuestOption = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  padding: 1rem 1.25rem;
  border: none;
  border-radius: var(--ui-radius);
  background: var(--ui-primary);
  color: #fff;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(17, 24, 39, 0.18);
  transition: background 0.15s ease;

  &:hover {
    background: #374151;
  }

  strong {
    display: block;
    font-size: 1.05rem;
    font-weight: 700;
  }

  small {
    display: block;
    margin-top: 0.2rem;
    font-size: 0.8rem;
    color: #d1d5db;
  }

  svg {
    flex-shrink: 0;
  }
`;

const Separator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1.5rem 0 1.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--ui-muted);

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: var(--ui-border);
  }
`;

const AccountTitle = styled.p`
  margin: 0 0 0.6rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--ui-text);
`;

const Benefits = styled.ul`
  list-style: none;
  margin: 0 0 1.25rem;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: var(--ui-muted);
  }
`;

// Primeiro acesso à agenda de um prestador: agendar sem cadastro (destaque) ou entrar/criar conta
export default function AccessChoiceDialog({ open, onClose }) {
  const [closing, setClosing] = useState(false);

  const continueAsGuest = () => {
    chooseGuest();
    setClosing(true);
    onClose?.();
  };

  return (
    <Modal open={open && !closing} title="Como você quer agendar?" onClose={continueAsGuest}>
      <GuestOption type="button" onClick={continueAsGuest}>
        <span>
          <strong>Quero agendar sem cadastro</strong>
          <small>Escolha o horário e informe só seu nome e WhatsApp.</small>
        </span>
        <ArrowRight size={20} />
      </GuestOption>

      <Separator>ou entre na sua conta</Separator>

      <AccountTitle>Acessar ou criar conta</AccountTitle>
      <Benefits>
        <li><CalendarCheck size={14} /> Histórico de agendamentos com todos os prestadores</li>
        <li><RefreshCw size={14} /> Remarque com poucos toques</li>
        <li><XCircle size={14} /> Cancele sem precisar do código</li>
      </Benefits>
      <CustomerAuthForm onSuccess={() => { setClosing(true); onClose?.(); }} />
    </Modal>
  );
}
