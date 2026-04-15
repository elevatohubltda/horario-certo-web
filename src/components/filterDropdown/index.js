import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { FunnelIcon } from "lucide-react"

export default function FilterDropdown({ filters, activeFilter, onChange, placeholder = "Filtrar" }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const containerRef = useRef(null);

  function handleSelect(filter) {
    setSelected(filter);
    setOpen(false);
    onChange(filter.value);
  }

  useEffect(() => {
    setSelected(activeFilter);
  }, [activeFilter]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Container ref={containerRef}>
      <Trigger onClick={() => setOpen(!open)}>
        {selected && selected.value ? (
          <>
            <Dot color={selected.color} />
            {selected.label}
          </>
        ) : (
            <>
              <FunnelIcon size={12}/>
              <span>{placeholder}</span>
            </>
        )}
      </Trigger>

      {open && (
        <Menu>
          {filters.map(filter =>
            filter.value !== selected?.value  && (
              <Option
                key={filter.value}
                onClick={() => handleSelect(filter)}
              >
                <Dot color={filter.color} />
                {filter.label}
              </Option>
            )
          )}
        </Menu>
      )}
    </Container>
  );
}

/* ================= styled-components ================= */

const Container = styled.div`
  position: relative;
  display: flex;
`;

const Trigger = styled.button`
  background: transparent;
  border: none;
  padding: 6px 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
`;

const Menu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: none;
  box-shadow: none;
  padding: 4px 0;
  z-index: 10;
  border: 1px solid rgb(204, 204, 204);
  width: max-content;
  min-width: 100%;
`;

const Option = styled.button`
  background: transparent;
  border: none;
  width: 100%;
  padding: 6px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
  white-space: nowrap;

  &:hover {
    background: #f5f5f5;
  }
`;

const Dot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ color }) => color};
`;
