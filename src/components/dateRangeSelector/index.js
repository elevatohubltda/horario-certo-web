import React from "react";
import { DateRange } from "react-date-range";
import { addDays } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { ReactComponent as Calendar } from "../../assets/icons/calendar.svg?component";
import { ptBR } from "date-fns/locale";
import styled from "styled-components";

const diasSemana3Letras = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const Wrapper = styled.div`
  position: relative;
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 9998;
`;

const Modal = styled.div`
  position: absolute;
  top: 3rem;
  left: -320%;
  transform: translateX(-50%);
  z-index: 9999;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 95vw;
  overflow: hidden;

  @media (max-width: 768px) {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 95vw;
    max-height: 90vh;
    overflow-y: auto;
  }

  .rdrCalendarWrapper {
    width: 100% !important;
  }
    
  .rdrSelected, .rdrInRange, .rdrStartEdge, .rdrEndEdge {
    background-color: var(--color-olive) !important;
    color: white !important;
  }

  .rdrDayStartPreview, .rdrDayEndPreview, .rdrDayInPreview {
    border-color: var(--color-sage) !important;
  }
    
  .rdrDateDisplayItemActive {
    border-color: var(--color-sage) !important;
  }
`;

const Actions = styled.div`
  padding: 0.5rem;
  text-align: right;
`;

const ApplyButton = styled.button`
  padding: 0.4rem 1rem;
  border-radius: 999px;
  border: 1px solid var(--color-sage);
  background: var(--color-sage);
  color: #fff;
  font-size: 0.8rem;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

/* =======================
   Component
======================= */

const DateRangeSelector = ({ onChangeRange, isActive }) => {
  const [showModal, setShowModal] = React.useState(false);

  const [range, setRange] = React.useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 15),
      key: "selection",
    },
  ]);

  const customPtBR = {
    ...ptBR,
    localize: {
      ...ptBR.localize,
      day: (dayIndex) => diasSemana3Letras[dayIndex] || "",
    },
  };

  const handleSelect = (ranges) => {
    setRange([ranges.selection]);
  };

  const applyRange = () => {
    onChangeRange(range[0]);
    setShowModal(false);
  };

  return (
    <Wrapper>
      <button
        className={isActive ? "active filter-button" : "filter-button"}
        onClick={() => setShowModal(true)}
      >
        <Calendar />
      </button>

      {showModal && <Overlay onClick={() => setShowModal(false)} />}

      {showModal && (
        <Modal>
          <DateRange
            locale={customPtBR}
            editableDateInputs
            onChange={handleSelect}
            moveRangeOnFirstSelection={false}
            ranges={range}
            months={1}
            direction="vertical"
          />

          <Actions>
            <ApplyButton onClick={applyRange}>
              Aplicar
            </ApplyButton>
          </Actions>
        </Modal>
      )}
    </Wrapper>
  );
};

export default DateRangeSelector;
