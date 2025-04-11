import styled from "styled-components";

export const Container = styled.div`
  display: ${({ display = 'inherit' }) => display};
  justify-content: ${({ justifycontent = 'unset' }) => justifycontent};
  align-items: ${({ alignitems = 'unset' }) => alignitems};
  width: ${({ width = '90%' }) => width};
  height: ${({ height = 'max-content' }) => height};
  margin: 0 auto;
  margin-top: ${({ margintop = '3rem' }) => margintop};
  padding: ${({ padding = '0' }) => padding};
  background-color: ${({ backgroundcolor = '#f8f8f8' }) => backgroundcolor};
  border-radius: ${({ borderradius = '0' }) => borderradius};
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.1);
`;