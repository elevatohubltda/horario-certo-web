import styled from "styled-components";

export const Title = styled.div`
    width: ${({ $width = '100%' }) => $width};
    margin: ${({ $margin = '1rem auto 0 auto' }) => $margin};
    padding: ${({ $padding = '0' }) => $padding};
    font-size: ${({ $fontsize = '1.5rem' }) => $fontsize};
    color: ${({ $color = '#000' }) => $color};
    font-weight: ${({ $fontweight = 'bold' }) => $fontweight};
    text-transform: ${({ $texttransform = 'none' }) => $texttransform};
    text-align: ${({ $align = 'left' }) => $align};
`; 