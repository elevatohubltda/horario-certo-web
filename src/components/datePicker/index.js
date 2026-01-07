import React, { useEffect, useState } from "react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/airbnb.css";
import styled, { createGlobalStyle } from "styled-components";
import { Portuguese } from "flatpickr/dist/l10n/pt";

/* =======================
   Styles
======================= */

const FlatpickrStyles = createGlobalStyle`
  .flatpickr-calendar {
    border: none;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  }

  .flatpickr-day.today {
    border: 1px solid var(--color-olive);
  }

  .flatpickr-day.selected {
    background: var(--color-brown);
    border: 1px solid var(--color-brown);
    color: #fff;
    &:hover {
      background: var(--color-brown);
      border: 1px solid var(--color-brown);
    }
  }
`;

const StyledFlatpickr = styled(Flatpickr)`
  padding: 0.6rem;
  background-color: #fff;
  border: 1px solid rgb(243, 243, 243);
  border-top: 1px solid var(--color-sage);
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: var(--color-sage);
  }
`;

/* =======================
   Component
======================= */

const DatePicker = ({ value, onChange }) => {
  const [date, setDate] = useState(null);

  useEffect(() => {
    if (!value) {
      const today = new Date();
      today.setHours(12, 0, 0, 0); // 🔥 corrige timezone
      setDate(today);
      onChange?.(today);
    } else {
      const parsed = new Date(value);
      parsed.setHours(12, 0, 0, 0);
      setDate(parsed);
    }
  }, [value, onChange]);

  if (!date) return null;

  return (
    <>
      <FlatpickrStyles />
      <StyledFlatpickr
        value={date}
        options={{
          locale: Portuguese,
          dateFormat: "d/m/Y",
          disableMobile: true
        }}
        onChange={(dates) => {
          const selected = dates[0];
          selected.setHours(12, 0, 0, 0);
          setDate(selected);
          onChange(selected);
        }}
      />
    </>
  );
};

export default DatePicker;
