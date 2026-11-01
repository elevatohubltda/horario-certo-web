import styled from "styled-components";

// Tabela no padrão visual do sistema: card branco, cabeçalho discreto e campos com borda arredondada

export const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  margin-top: 0;
  background: #fff;
  border-radius: var(--ui-radius);
  box-shadow: var(--ui-card-shadow);
`;

export const TableHeaderActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 1rem;
  margin-top: 0;
  padding: 0.9rem 1rem;
  border-radius: var(--ui-radius);
  background-color: #fff;
  box-shadow: var(--ui-card-shadow);
`;

export const PageSizeField = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: var(--ui-text-secondary);

  label {
    font-weight: 500;
    color: var(--ui-text-secondary);
  }
`;

export const SelectWrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;

  select {
    appearance: none;
    border: 1px solid var(--ui-input-border);
    border-radius: var(--ui-radius-sm);
    padding: 0.45rem 28px 0.45rem 0.7rem;
    background: #fff;
    color: var(--ui-text);
    min-width: 96px;
    font-size: 0.85rem;
    text-align: center;
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: var(--ui-primary);
    }
  }

  svg {
    position: absolute;
    right: 8px;
    pointer-events: none;
    color: var(--ui-muted);
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.82rem;
`;

export const Th = styled.th`
  padding: 0.7rem 0.8rem;
  font-size: 0.8rem;
  font-weight: 600;
  background-color: #fff;
  color: var(--ui-muted);
  border-bottom: 1px solid var(--ui-border);
  text-align: center;
  white-space: nowrap;

  &:first-child {
    width: 48px;
  }
`;

export const Td = styled.td`
  padding: 0.7rem 0.8rem;
  text-align: center;
  color: var(--ui-text-secondary);
  border-top: 1px solid #f3f4f6;

  &:first-child {
    width: 48px;
    padding-left: 14px;
    padding-right: 14px;
  }

  input[type='checkbox'] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
`;

export const Tr = styled.tr`
  transition: background-color 0.2s ease;
  height: 52px;
  background-color: #fff;

  &:hover {
    background-color: #f9fafb;
  }
`;

export const ActionButton = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.35rem;
`;

// Mesmo botão de ação das telas de gestão: quadrado branco com borda e ícone
export const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid var(--ui-border);
  background: #fff;
  cursor: pointer;
  color: var(--ui-text-secondary);

  &:hover {
    background: #f3f4f6;
  }
`;

export const DialogInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 0.5rem 0.6rem;
  margin-bottom: 1rem;
  background-color: #fff;
  border: 1px solid var(--ui-input-border);
  border-radius: var(--ui-radius-sm);
  font-size: 0.85rem;
  color: var(--ui-text);

  &:focus {
    outline: none;
    border-color: var(--ui-primary);
  }
`;

export const DialogSelect = styled.select`
  width: 100%;
  box-sizing: border-box;
  padding: 0.5rem 28px 0.5rem 0.6rem;
  margin-top: .4rem;
  margin-bottom: 1rem;
  background-color: #fff;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 18px;
  border: 1px solid var(--ui-input-border) !important;
  border-radius: var(--ui-radius-sm);
  font-size: 0.85rem;
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
    color: var(--ui-text);
  }
`;

export const Label = styled.label`
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--ui-text-secondary);
  margin-bottom: 4px;
  display: block;
`;
