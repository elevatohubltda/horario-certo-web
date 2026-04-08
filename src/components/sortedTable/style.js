import styled from "styled-components";

export const TableWrapper = styled.div`
  width: calc(100%-2px);
  overflow-x: auto;
  margin-top: 24px;
  border: 1px solid var(--color-background);
  border-radius: 10px;
`;

export const TableHeaderActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
  margin-top: 8px;
  padding: 14px 16px;
  border-radius: 10px;
  background-color: #fff;
  border: 1px solid var(--color-olive);
  box-shadow: inset 0 0 0 1px transparent;
`;

export const PageSizeField = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--color-dark);

  label {
    font-weight: 600;
    color: var(--color-dark);
  }
`;

export const SelectWrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;

  select {
    appearance: none;
    border: 1px solid var(--color-olive);
    border-radius: 6px;
    padding: 8px 28px 8px 12px;
    background: #fff;
    color: var(--color-dark);
    min-width: 96px;
    font-size: 0.95rem;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      border-color: var(--color-sage);
    }

    &:focus {
      outline: none;
      border-color: var(--color-sage);
      box-shadow: 0 0 0 2px rgba(142, 152, 142, 0.2);
    }
  }

  svg {
    position: absolute;
    right: 8px;
    pointer-events: none;
    color: var(--color-olive);
  }
`;

export const Table = styled.table`
  width: 100%;  
  border-collapse: separate;
  border-spacing: 0;
`;

export const Th = styled.th`
  padding: 12px;
  font-size: 12px;
  background-color: var(--color-background);
  text-transform: uppercase;
  color: var(--color-dark);
  text-align: center;

  &:first-child {
    width: 48px;
  }
`;

export const Td = styled.td`
  padding: 12px;
  text-align: center;
  border-top: 1px solid rgba(142, 152, 142, 0.2);

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
  background-color: #eeede70a;

  &:hover {
    background-color: rgba(142, 152, 142, 0.08);
  }
`;

export const ActionButton = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
`;

export const IconButton = styled.button`
  background: transparent;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: var(--color-dark);

  &:hover {
    color: var(--color-sage);
  }
`;

export const DialogInput = styled.input`
  width: 100%;
  padding: 8px 4px;
  margin-bottom: 1.25rem;

  background-color: transparent;
  border: none;
  border-bottom: 1px solid var(--color-olive);

  font-size: 14px;
  color: var(--color-dark);

  &:focus {
    outline: none;
    border-bottom-color: var(--color-sage);
  }
`;

export const Label = styled.label`
  font-size: 12px;
  color: var(--color-olive);
  margin-bottom: 4px;
  display: block;
`;