import React, { useState } from 'react';
import styled from 'styled-components';
import {
  TriangleAlert,
  CheckCircle,
  XCircle,
  Hourglass
} from 'lucide-react';

const AlertContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  background-color: #fefefe;
  border: 1px solid #ccc;
  border-left: ${props =>
    props.type === 'success' ? '6px solid #28a745'
    : props.type === 'warning' ? '6px solid #ffc107'
    : props.type === 'error' ? '6px solid #dc3545'
    : '6px solid #007bff'};
  padding: 16px 24px;
  border-radius: 8px;
  margin: 10px 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const IconWrapper = styled.div`
  margin-right: 12px;
  display: flex;
  align-items: center;

  svg {
    width: 24px;
    height: 24px;
    color: ${props => {
      switch (props.type) {
        case 'success': return '#28a745';
        case 'warning': return '#ffc107';
        case 'error': return '#dc3545';
        case 'waiting': return '#007bff';
        default: return '#007bff';
      }
    }};
  }
`;

const Message = styled.div`
  flex: 1;
  font-size: 14px;
  color: #333;
`;

const CloseButton = styled.button`
  border: none;
  background: transparent;
  color: #333;
  font-size: 18px;
  cursor: pointer;
  margin-left: 12px;

  &:hover {
    color: #000;
  }
`;

function getIcon(type) {
  switch (type) {
    case 'warning': return <TriangleAlert />;
    case 'success': return <CheckCircle />;
    case 'error': return <XCircle />;
    case 'waiting': return <Hourglass />;
    default: return <TriangleAlert />;
  }
}

export default function Alert({ badge, message, onClose }) {
  const [visible, setVisible] = useState(true);

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  if (!visible) return null;

  return (
    <AlertContainer type={badge}>
      <IconWrapper type={badge}>{getIcon(badge)}</IconWrapper>
      <Message>{message}</Message>
      <CloseButton onClick={handleClose}>&times;</CloseButton>
    </AlertContainer>
  );
}
