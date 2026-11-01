import styled from "styled-components";

// Barra de filtros com botões em pílula, no padrão dos botões do sistema
export const CustomFilterStyle = styled.div`
  display: flex;
  gap: .5rem;
  justify-content: end;
  align-items: center;
  flex-wrap: wrap;
  padding: ${({ $padding = '1rem 1rem 0 0' }) => $padding};
  width: ${({ $width = '100%' }) => $width};
  margin: ${({ $margin = '1rem auto auto auto' }) => $margin};
  box-sizing: border-box;

  .filter-button{
    font-family: inherit;
    padding: 0.45rem 0.95rem;
    border-radius: 999px;
    height: auto;
    cursor: pointer;
    transition: .2s;
    border: 1px solid var(--ui-input-border);
    background: #fff;
    color: var(--ui-text-secondary);
    font-size: 0.82rem;
    font-weight: 500;
  }
  .filter-button:hover{
    background-color: #f3f4f6;
  }
  .filter-button.active{
    background-color: var(--ui-primary);
    border: 1px solid var(--ui-primary);
    color: #fff;
  }
`;
