import React, { useState } from "react";
import styled from "styled-components";
import { CalendarCheck, RefreshCw, XCircle } from "lucide-react";
import { Modal } from "../admin";
import CustomerAuthForm from "./CustomerAuthForm";
import { chooseGuest } from "../../util/customerSession";

const Intro = styled.p`
  margin: 0 0 1rem;
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--ui-text-secondary);
`;

const Benefits = styled.ul`
  list-style: none;
  margin: 0 0 1.25rem;
  padding: 0.85rem 1rem;
  border-radius: var(--ui-radius-sm);
  background: #f9fafb;
  border: 1px solid var(--ui-border);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.82rem;
    color: var(--ui-text-secondary);
  }
`;

const GuestButton = styled.button`
  display: block;
  width: 100%;
  margin-top: 1rem;
  padding: 0.6rem;
  border: none;
  background: none;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--ui-muted);
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    color: var(--ui-text);
  }
`;

// Primeiro acesso à agenda de uma empresa: seguir sem conta ou entrar/criar conta
export default function AccessChoiceDialog({ open, companyName, onClose }) {
  const [closing, setClosing] = useState(false);

  const continueAsGuest = () => {
    chooseGuest();
    setClosing(true);
    onClose?.();
  };

  return (
    <Modal open={open && !closing} title="Como você quer agendar?" onClose={continueAsGuest}>
      <Intro>
        Entre para agendar{companyName ? ` na ${companyName}` : ""} sem digitar seus dados toda vez e
        acompanhar tudo em um só lugar.
      </Intro>
      <Benefits>
        <li><CalendarCheck size={15} /> Histórico de agendamentos de todas as barbearias</li>
        <li><RefreshCw size={15} /> Remarque com poucos toques</li>
        <li><XCircle size={15} /> Cancele sem precisar do código</li>
      </Benefits>
      <CustomerAuthForm onSuccess={() => { setClosing(true); onClose?.(); }} />
      <GuestButton type="button" onClick={continueAsGuest}>Continuar sem conta</GuestButton>
    </Modal>
  );
}
