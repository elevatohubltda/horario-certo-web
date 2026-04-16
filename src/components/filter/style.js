import styled from "styled-components";

// Styled component named StyledButton
export const CustomFilterStyle = styled.div`
  display: flex;
  gap: .5rem;
  justify-content: end;
  padding: ${({ $padding = '1rem 1rem 0 0' }) => $padding};
  width: ${({ $width = '100%' }) => $width};
  margin: ${({ $margin = '1rem auto auto auto' }) => $margin};

  .filter-button{
    padding: 0;
    border: none;
    background: none;
    font-family: Montserrat;
    padding: .25rem .5rem;
    border-radius: 1.25rem;
    height: 2.5rem;
    cursor: pointer;
    transition: .3s;
    border: 1px solid var(--color-sage);
    color: var(--color-sage);
    font-weight: 500;
  }
  .filter-button:hover{
    background-color:rgb(90, 90, 90);
    border: 1px solid rgb(90, 90, 90);
    color: #fff;
  }
  .filter-button.active{
    background-color: var(--color-sage);
    border: 1px solid var(--color-sage);
    color: #fff;
  }
`;