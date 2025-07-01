import React from 'react';
import styled from 'styled-components';
import { Separator } from '../separator/style';

// Overlay escuro atrás do modal
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: transparent;
  font-size: 1.25rem;
  cursor: pointer;
  font-size: 1.5rem;
  border: 1px solid black;
  border-radius: 2rem;
  padding: 0;
  width: 30px;
  color: #616161;
  border-color: #616161;

  &:hover{
    color: #000;
    border-color: #000;
  }
`;

const DialogBox = styled.div`
  position: relative;
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 80%;
  max-width: 400px;
  text-align: center;
`;

// Botões
const ButtonGroup = styled.div`
  margin-top: 2rem;
  display: flex;
  justify-content: space-around;
  gap: 12px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  ${({ variant }) =>
    variant === 'confirm'
      ? `
    background-color: #6A5ACD;
    color: white;
  `
      : `
    background-color: #ccc;
    color: #333;
  `}
`;

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, close, confirmText, cancelText }) => {
  if (!isOpen) return null;

  const handleOutsideClick = () => {
    close();
  };

  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  return (
    <Overlay $isOpen={isOpen} onClick={handleOutsideClick}>
      <DialogBox onClick={stopPropagation}>
        <CloseButton onClick={close}>&times;</CloseButton>
        <h2>{title}</h2>
        <Separator $width="100%" $bordercolor="#ccc" $margin="1rem 0 1rem 0" />
        <p>{message}</p>
        <ButtonGroup>
          {onCancel && 
            <Button variant="cancel" type="button" onClick={onCancel}>{cancelText}</Button>
          }
          <Button variant="confirm" type="button" onClick={onConfirm}>{confirmText}</Button>
        </ButtonGroup>
      </DialogBox>
    </Overlay>
  );
};

export default ConfirmDialog;
