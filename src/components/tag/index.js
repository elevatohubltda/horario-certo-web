import styled from "styled-components";

export const Tag = styled.div`
    padding: 4px 8px;
    border: none;
    border-radius: 16px;
    width: fit-content;
    font-size: 0.6rem;
    color: ${({ $color }) => $color};
    text-transform: ${({ $texttransform }) => $texttransform};
    background: ${({ $background }) => $background};
`;