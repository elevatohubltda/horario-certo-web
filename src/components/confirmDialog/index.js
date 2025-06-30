import React from 'react';
import styled from 'styled-components';

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

// Caixinha branca
const DialogBox = styled.div`
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

// Botões
const ButtonGroup = styled.div`
  margin-top: 20px;
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

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, close }) => {
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
        <h2>{title}</h2>
        <p>{message}</p>
        <ButtonGroup>
          <Button variant="confirm" type='submit' onClick={onConfirm}>Confirmar</Button>
          <Button variant="cancel" onClick={onCancel}>Cancelar</Button>
        </ButtonGroup>
      </DialogBox>
    </Overlay>
  );
};

export default ConfirmDialog;
