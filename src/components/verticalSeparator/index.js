import styled from "styled-components";

export const VerticalSeparator = styled.div`
  height: ${({ $height = '-webkit-fill-available' }) => $height};
  border-right: 1px solid ${({ $bordercolor = 'rgba(0,0,0,0.15)' }) => $bordercolor};
  width: 1px;
  margin: ${({ $margin = '0' }) => $margin};
  margin-top: ${({ $margintop = '6rem' }) => $margintop};
`;