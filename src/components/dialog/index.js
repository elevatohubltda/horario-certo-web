import React from 'react';
import styled from 'styled-components';

// ---------- Styled ----------
// Mesmo visual do modal das telas de gestão: cantos arredondados, sombra suave e rolagem interna
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: ${({ open }) => (open ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
  box-sizing: border-box;
`;

const Container = styled.div`
  background: #fff;
  padding: 1.25rem 1.5rem;
  border-radius: var(--ui-radius, 0.75rem);
  width: 100%;
  max-width: ${({ $mobile }) => ($mobile ? '100%' : '560px')};
  max-height: 90vh;
  overflow-y: auto;
  box-sizing: border-box;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
`;

// ---------- Component ----------
export default function Dialog({ open, onClose, children, mobile }) {
  return (
    <Overlay open={open} onClick={onClose}>
      <Container $mobile={mobile} onClick={(e) => e.stopPropagation()}>
        {children}
      </Container>
    </Overlay>
  );
}
