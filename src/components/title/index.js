import styled from "styled-components";

// Título padrão do sistema: cor e peso iguais em todas as telas (as props antigas de cor e caixa alta
// são ignoradas de propósito); tamanho, largura, margem e alinhamento continuam configuráveis.
export const Title = styled.div`
    width: ${({ $width = '100%' }) => $width};
    margin: ${({ $margin = '1rem auto 0 auto' }) => $margin};
    padding: ${({ $padding = '0' }) => $padding};
    font-size: ${({ $fontsize = '1.5rem' }) => $fontsize};
    color: var(--ui-text, #111827);
    font-weight: 700;
    text-transform: none;
    text-align: ${({ $align = 'left' }) => $align};
`;
