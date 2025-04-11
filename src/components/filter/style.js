import styled from "styled-components";

// Styled component named StyledButton
export const FilterStyle = styled.div`
  display: flex;
  gap: .5rem;
  justify-content: end;
  padding: 1rem 1rem 0 0;

  button{
    padding: 0;
    border: none;
    background: none;
    font-family: Montserrat;
    padding: .25rem .5rem;
    border-radius: 1.25rem;
    height: 2.5rem;
    cursor: pointer;
    transition: .3s;
    border: 1px solid #6A5ACD;
    color: #6A5ACD;
    font-weight: 500;
  }
  button:hover{
    background-color:rgb(76, 64, 148);
    border: 1px solid rgb(76, 64, 148);
    color: #fff;
  }
`;