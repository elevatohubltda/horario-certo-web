import styled from "styled-components";

// Styled component named StyledButton
export const CalendarContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 0 2rem;

  .Calendar{
    height: max-content;
  }

  .-weekend:not(.-selected):not(.-blank):not(.-selectedStart):not(.-selectedEnd):not(.-selectedBetween){
    color: rgba(106, 90, 205, 0.5) !important;
  }
`;