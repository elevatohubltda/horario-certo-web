import React from 'react';
import styled from 'styled-components';

// ---------- Styled ----------
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: ${({ open }) => (open ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const Container = styled.div`
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  min-width: 300px;
  max-width: 90%;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
`;

// ---------- Component ----------
export default function Dialog({ open, onClose, children }) {
  return (
    <Overlay open={open} onClick={onClose}>
      <Container onClick={(e) => e.stopPropagation()}>
        {children}
      </Container>
    </Overlay>
  );
}
