import styled from "styled-components";

export const DialogInput = styled.input`
  width: 100%;
  padding: 8px 0px;
  margin-bottom: 1.25rem;

  background-color: transparent;
  border: none;
  border-top: 1px solid var(--color-olive);

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

export const DialogSelect = styled.select`
  width: 100%;
  height: 56px;
  padding: 8px 28px 8px 4px;
  margin-top: .5rem;
  margin-bottom: 1.25rem;
  background-color: transparent;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7d6b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 18px;
  border: none !important;
  border-top: 1px solid var(--color-olive) !important;
  font-size: 14px;
  color: var(--color-dark);
  cursor: pointer;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.05);

  &:focus {
    outline: none;
    border-bottom-color: var(--color-sage) !important;
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
  font-size: 11px;
  padding: 4px 10px;
  background-color: transparent;
  border: 1px solid var(--color-sage);
  color: var(--color-sage);
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  margin-left: 3rem;

  &:hover {
    background-color: var(--color-sage);
    color: #fff;
  }
`;
