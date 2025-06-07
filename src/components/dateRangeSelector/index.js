import React from "react";
import { DateRange } from "react-date-range";
import { addDays } from 'date-fns';
import 'react-date-range/dist/styles.css'; // estilos base
import 'react-date-range/dist/theme/default.css'; // tema padrão
import { ReactComponent as Calendar } from '../../assets/icons/calendar.svg';
import { ptBR } from 'date-fns/locale';

const diasSemana3Letras = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const DateRangeSelector = ({ onChangeRange, isActive }) => {
  const [showModal, setShowModal] = React.useState(false);
  const [range, setRange] = React.useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 15),
      key: 'selection'
    }
  ]);

  const customPtBR = {
    ...ptBR,
    localize: {
      ...ptBR.localize,
      day: (dayIndex) => diasSemana3Letras[dayIndex] || '',
    }
  };

  const handleSelect = (ranges) => {
    setRange([ranges.selection]);
  };

  const applyRange = () => {
    onChangeRange(range[0]);
    setShowModal(false);
  };

  return (
    <div style={{ position: "relative" }}>
        <button
            className={isActive ? "active filter-button" : "filter-button"}
            onClick={() => setShowModal(!showModal)}
        >
            <Calendar />
        </button>

        {showModal && (
            <div 
                className="date-range-selector"
                style={{
                    position: "absolute",
                    top: "3rem",
                    marginLeft: "-20rem",
                    zIndex: 10,
                    background: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
                }}
            >
                <DateRange
                    locale={customPtBR}
                    editableDateInputs={true}
                    onChange={handleSelect}
                    moveRangeOnFirstSelection={false}
                    ranges={range}
                />
                <div style={{ padding: "0.5rem", textAlign: "right" }}>
                    <button onClick={applyRange} style={{ padding: "0.3rem 1rem" }} className="filter-button">
                        Aplicar
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};

export default DateRangeSelector;
