import { useState } from "react";
import styled from "styled-components";
import { FunnelIcon } from "lucide-react"

export default function FilterDropdown({ filters, onChange }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  function handleSelect(filter) {
    setSelected(filter);
    setOpen(false);
    onChange?.(filter.value);
  }

  return (
    <Container>
      <Trigger onClick={() => setOpen(!open)}>
        {selected && selected.value ? (
          <>
            <Dot color={selected.color} />
            {selected.label}
          </>
        ) : (
            <>
              <FunnelIcon size={12}/>
              <span>Filtrar</span>
            </>
        )}
      </Trigger>

      {open && (
        <Menu>
          {filters.map(filter =>
            filter.value !== selected?.value && (
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
