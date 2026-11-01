import styled from "styled-components";

// Divisória fina e sólida, padrão do sistema. As props de estilo/cor antigas (ex.: pontilhado)
// são ignoradas de propósito para manter todas as telas iguais; largura e margem continuam valendo.
export const Separator = styled.div`
  height: 1px;
  border-top: 1px solid var(--ui-border, #e5e7eb);
  width: ${({ $width = '80%' }) => $width};
  margin: ${({ $margin = '2rem 0' }) => $margin};
`;
