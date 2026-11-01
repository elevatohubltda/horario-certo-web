import styled from "styled-components";

// Campos dos diálogos de agendamento no padrão do sistema (borda arredondada, foco escuro)
export const DialogInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  height: auto;
  padding: 0.5rem 0.6rem;
  margin: 0.3rem 0 1rem 0;
  background-color: #fff;
  border: 1px solid var(--ui-input-border);
  border-radius: var(--ui-radius-sm);
  font-size: 0.88rem;
  color: var(--ui-text);

  &:focus {
    outline: none;
    border-color: var(--ui-primary);
  }

  &:read-only {
    background: #f9fafb;
    border-color: var(--ui-border);
  }
`;

export const Label = styled.label`
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--ui-text-secondary);
  margin-bottom: 2px;
  display: block;
`;

export const DialogSelect = styled.select`
  width: 100%;
  box-sizing: border-box;
  padding: 0.5rem 28px 0.5rem 0.6rem;
  margin-top: .3rem;
  margin-bottom: 1rem;
  background-color: #fff;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 18px;
  border: 1px solid var(--ui-input-border) !important;
  border-radius: var(--ui-radius-sm);
  font-size: 0.88rem;
  color: var(--ui-text);
  cursor: pointer;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;

  &:focus {
    outline: none;
    border-color: var(--ui-primary) !important;
  }

  option {
    background-color: #fff;
    color: var(--color-dark);
    height: 40px;
    line-height: 40px;
    padding: 8px;
    transform: none;
  }
`;

export const DateHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1.5rem;
  margin-bottom: 0.5rem;
  margin-top: 1rem;
`;

export const WaitlistButton = styled.button`
  font-size: 0.75rem;
  padding: 0.3rem 0.75rem;
  background-color: #fff;
  border: 1px solid var(--ui-input-border);
  color: var(--ui-text-secondary);
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  margin-left: 3rem;

  &:hover {
    background-color: #f3f4f6;
  }
`;
