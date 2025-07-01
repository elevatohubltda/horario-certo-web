import styled from "styled-components";

// Styled component named StyledButton
export const TopbarStyle = styled.div`
  background-color: #fff;
  height: 60px;
  color: black;
  left: 0;
  right: 0;
  top: 0;
  box-shadow: 1px 1px 6px 0px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  
  .establishmentBox img{
    height: 40px;
    margin-left: 20px;
  }
  
  svg{
    color: #6a5acd;
  }

  p{
    background-color: #A8AAE6;
  }

  .menu{
    width: 100%;
    padding-right: 1rem;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 1rem;

    button{
      padding: 0;
      border: none;
      background: none;
      font-family: Montserrat;
      padding: .25rem 1rem;
      border-radius: 1.25rem;
      height: 2.5rem;
      cursor: pointer;
      transition: .3s;
    }
    
    svg {
      height: 6rem;
    }

    .be-a-partner{
      border: 1px solid #6A5ACD;
      color: #6A5ACD;
    }
    .be-a-partner:hover{
      background-color: #8f85cc;
      color: #fff;
    }

    .my-area{
      background-color: #6A5ACD;
      border: 1px solid #6A5ACD;
      color: #fff;
    }

    .my-area:hover{
      background-color: #8f85cc;
      border: 1px solid #6A5ACD;
      color: #fff;
    }

    .user-button{
      border: 1px solid #6A5ACD;
      padding: .25rem .5rem;
      transition: .5s;

      svg{
        color: #6A5ACD;
        height: 1.25rem;
        transition: .5s;
      }
    }

    .user-button:hover{
      border: 1px solid #6A5ACD;
      padding: .25rem .5rem;
      background-color: #6A5ACD;

      svg{
        color: #ffffff;
        height: 1.25rem;
      }
    }

    .menu-button{
      padding: .25rem .5rem;
      transition: .3s;

      svg{
        color: darkgray;
        height: 2rem;
        transition: .3s;
      }
    }

    .menu-button:hover{
      border: 1px solid darkgray;
      padding: .25rem .5rem;
      background-color: gray;

      svg{
        color: #ffffff;
        height: 1.25rem;
      }
    }
  }
  .establishmentBox{
    width: fit-content;
    padding: 0 4rem;
    display: flex;
    align-items: center;

    h3{
      color: black;
      font-family: 'Montserrat';
      font-weight: 500;
      text-transform: uppercase;
    }

    img{
      max-width: 40px;
      border-radius: 50px;
      -webkit-box-shadow: 2px 2px 5px 0px rgba(0,0,0,0.15);
      -moz-box-shadow: 2px 2px 5px 0px rgba(0,0,0,0.15);
      box-shadow: 2px 2px 5px 0px rgba(0,0,0,0.15);
    }

    .content{
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      span{
        color: black;
        font-family: 'Montserrat';
        text-transform: capitalize;
        font-size: 0.8rem;
        margin-left: 1rem;
        width: max-content;
      }

      .social-media{
        display: flex;
        gap: .5rem;
    
        .whatsapp{
          color: #4ECB5C;
          font-size: 20px;
          cursor: pointer;
        }
    
        .instagram{
          color: #FF0878;
          font-size: 20px;
          cursor: pointer;
        }
      }
    }
  }
  .establishmentBoxMobile{
    width: fit-content;
    padding: 0 0 0 1rem;
    display: flex;
    align-items: center;

    h3{
      color: black;
      font-family: 'Montserrat';
      font-weight: 500;
      text-transform: uppercase;
    }

    img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      box-shadow: 2px 2px 5px 0px rgba(0,0,0,0.15);
    }

    .content{
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      span{
        color: black;
        font-family: 'Montserrat';
        text-transform: capitalize;
        font-size: 0.8rem;
        margin-left: 1rem;
        width: max-content;
      }

      .social-media{
        display: flex;
        gap: .5rem;
    
        .whatsapp{
          color: #4ECB5C;
          font-size: 20px;
          cursor: pointer;
        }
    
        .instagram{
          color: #FF0878;
          font-size: 20px;
          cursor: pointer;
        }
      }
    }
  }

  .menu {
    position: relative;
    display: flex;
  }

  .user-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
  }

  .user-dropdown {
    position: absolute;
    right: 0;
    top: 100%;
    margin-top: 8px;
    background-color: white;
    border: 1px solid #ccc;
    width: 160px;
    box-shadow: 0px 4px 8px rgba(0,0,0,0.1);
    z-index: 999;
  }

  .dropdown-item {
    cursor: pointer;
    font-size: 14px;

    button{
      width: 100%;
      padding: 10px 16px;
      text-align: left;
    }
  }

  .dropdown-item:hover {
    background-color: #f2f2f2;
  }
  
  .Toastify div.Toastify__toast-container--top-right {
    margin-top: 60px;
  }

  .Toastify div.Toastify__toast-container--bottom-right {
    margin-bottom: 1.5rem;
    padding: 0 1rem;
  }
`;