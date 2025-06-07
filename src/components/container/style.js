import styled from "styled-components";

export const Container = styled.div`
  display: ${({ $display = 'inherit' }) => $display};
  justify-content: ${({ $justifycontent = 'unset' }) => $justifycontent};
  align-items: ${({ $alignitems = 'unset' }) => $alignitems};
  width: ${({ $width = '90%' }) => $width};
  height: ${({ $height = 'max-content' }) => $height};
  margin: ${({ $margin = '1rem auto 0 auto' }) => $margin};
  padding: ${({ $padding = '0' }) => $padding};
  background-color: ${({ $backgroundcolor = '#f8f8f8' }) => $backgroundcolor};
  border-radius: ${({ $borderradius = '0' }) => $borderradius};
  border: ${({ $border = 'none' }) => $border};
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.1);

  .loader {
    width: 48px;
    height: 48px;
    border: 5px solid #6A5ACD;
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
    }

    @keyframes rotation {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
  } 
`;