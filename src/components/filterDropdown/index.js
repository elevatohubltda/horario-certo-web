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

// Filtro suspenso no padrão dos botões do sistema (pílula branca com borda e menu em card)
const Trigger = styled.button`
  background: #fff;
  border: 1px solid var(--ui-input-border);
  border-radius: 999px;
  padding: 0.45rem 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--ui-text-secondary);

  &:hover {
    background: #f3f4f6;
  }
`;

const Menu = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  background: #fff;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-sm);
  box-shadow: var(--ui-card-shadow);
  padding: 4px 0;
  z-index: 10;
  width: max-content;
  min-width: 100%;
`;

const Option = styled.button`
  background: transparent;
  border: none;
  width: 100%;
  padding: 0.45rem 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: var(--ui-text-secondary);
  white-space: nowrap;

  &:hover {
    background: #f3f4f6;
  }
`;

const Dot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ color }) => color};
`;
