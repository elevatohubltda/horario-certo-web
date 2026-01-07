import React from 'react';
import styled from 'styled-components';

const StepperContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1rem 0;
`;

const StepItem = styled.div`
  display: flex;
  align-items: center;
`;

const StepCircle = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid ${props => props.completed || props.active ? 'var(--color-sage)' : '#ccc'};
  background-color: ${props => props.completed ? 'var(--color-sage)' : props.active ? 'var(--color-sage)' : '#fff'};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.3s ease;
`;

const StepLine = styled.div`
  width: 50px;
  height: 2px;
  background-color: ${props => props.completed ? '#6A5ACD' : '#ccc'};
  transition: all 0.3s ease;
`;

const Stepper = ({ steps, currentStep }) => {
  return (
    <StepperContainer>
      {steps.map((label, index) => (
        <StepItem key={index}>
          <StepCircle
            completed={currentStep > index}
            active={currentStep === index}
          >
            {currentStep > index ? '✓' : ''}
          </StepCircle>
          {index < steps.length - 1 && (
            <StepLine completed={currentStep > index} />
          )}
        </StepItem>
      ))}
    </StepperContainer>
  );
};

export default Stepper;
