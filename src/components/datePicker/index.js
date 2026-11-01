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
    border: 1px solid var(--ui-input-border);
  }

  .flatpickr-day.selected {
    background: var(--ui-primary);
    border: 1px solid var(--ui-primary);
    color: #fff;
    &:hover {
      background: var(--ui-primary);
      border: 1px solid var(--ui-primary);
    }
  }
`;

const StyledFlatpickr = styled(Flatpickr)`
  padding: 0.6rem;
  background-color: #fff;
  border: 1px solid var(--ui-input-border);
  border-radius: var(--ui-radius-sm);
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: var(--ui-primary);
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
