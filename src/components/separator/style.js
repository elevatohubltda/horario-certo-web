import styled from "styled-components";

export const Separator = styled.div`
  height: 1px;
  border-top: 1px solid ${({ bordercolor = 'rgba(0,0,0,0.15)' }) => bordercolor};
  width: ${({ width = '80%' }) => width};
  margin: 2rem 0;
`;