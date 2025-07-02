// DatePicker.js
import React from "react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/airbnb.css";
import styled, { createGlobalStyle } from "styled-components";
import { Portuguese } from "flatpickr/dist/l10n/pt.js";

// Estilos globais para o calendário
const FlatpickrStyles = createGlobalStyle`
  .flatpickr-calendar {
    border: none;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    font-family: 'Segoe UI', sans-serif;
  }

  .flatpickr-months {
    background: #fff;
    border-bottom: 1px solid #ddd;
  }

  .flatpickr-month {
    color: #333;
    font-weight: 600;
  }

  .flatpickr-weekday {
    color: #888;
    font-weight: 600;
  }

  .flatpickr-day {
    border-radius: 50%;
    transition: background 0.2s ease;
  }

  .flatpickr-day.today {
    border: 1px solid #8a7aff;
  }

  .flatpickr-day.selected {
    background: #8a7aff;
    color: #fff;
  }

  .flatpickr-day:hover {
    background:rgb(197, 197, 197);
  }
`;

// Input com mesmo estilo dos outros campos
const StyledInput = styled.input`
  width: calc(100% - 4px);
  padding-left: 0;
  background-color: transparent !important;
  border: 1px solid rgb(243, 243, 243);
  border-top: none !important;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #8a7aff;
    box-shadow: 0 0 0 2px rgba(138, 122, 255, 0.1);
  }
`;



const DatePicker = ({ value, onChange }) => {
  return (
    <>
    { value && 
        <>
            <FlatpickrStyles />
            <Flatpickr
                options={{
                locale: Portuguese,
                dateFormat: "d/m/Y",
                disableMobile: true
                }}
                value={value}
                onChange={(selectedDates) => onChange(selectedDates[0])}
                render={({ defaultValue, value, ...props }, ref) => (
                <StyledInput {...props} ref={ref} placeholder="Selecione a data" />
                )}
            />
        </>
      }
    </>
  );
};

export default DatePicker;
