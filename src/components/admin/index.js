import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import Topbar from "../topbar";
import Sidebar from "../sidebar";
import { Container } from "../container/style";
import { isAdmin, isAvailableLogin } from "../../util/auth";
import { isMobile } from "../../util/util";

/* ================= LAYOUT ================= */

// Estrutura comum das telas de gestão: topo, menu lateral e cabeçalho da página.
// requireAdmin=false para telas do dono da empresa que reaproveitam o mesmo visual.
export function AdminLayout({ title, subtitle, actions, children, requireAdmin = true }) {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState(false);
  const companyInfo = Cookies.get("companyInfo") ? JSON.parse(Cookies.get("companyInfo")) : {};

  useEffect(() => {
    if (!isAvailableLogin()) {
      navigate("/login");
      return;
    }
    setMobile(isMobile());
  }, [navigate]);

  return (
    <>
      <Topbar {...companyInfo} loggedIn />
      <Container
        $width="100%"
        $display="flex"
        $flexdirection="column"
        $padding={mobile ? "1rem" : "0"}
        $margin="0"
        $backgroundcolor="transparent"
        $borderRadius="0"
        $boxshadow="none"
      >
        <Sidebar>
          <Page>
            <Header>
              <div>
                <PageTitle>{title}</PageTitle>
                {subtitle && <Subtitle>{subtitle}</Subtitle>}
              </div>
              {actions && <HeaderActions>{actions}</HeaderActions>}
            </Header>
            {!requireAdmin || isAdmin() ? children : <Message>Acesso restrito a administradores.</Message>}
          </Page>
        </Sidebar>
      </Container>
    </>
  );
}

const Page = styled.div`
  padding: 1rem 0 3rem;
  max-width: 1200px;
  overflow-y: auto;
  height: 100%;
  box-sizing: border-box;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
`;

const PageTitle = styled.h1`
  margin: 0 0 0.25rem;
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--color-dark);
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: #6b7280;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

/* ================= BLOCOS ================= */

export const Card = styled.div`
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  padding: ${(props) => props.$padding || "1rem"};
`;

export const TableCard = styled(Card)`
  padding: 0;
  overflow-x: auto;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
  min-width: ${(props) => props.$minWidth || "760px"};

  th {
    text-align: left;
    font-weight: 600;
    color: #6b7280;
    padding: 0.7rem 0.8rem;
    border-bottom: 1px solid #e5e7eb;
    white-space: nowrap;
  }

  td {
    padding: 0.7rem 0.8rem;
    border-bottom: 1px solid #f3f4f6;
    color: #374151;
    vertical-align: top;
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

export const Muted = styled.div`
  font-size: 0.72rem;
  color: #9ca3af;
  margin-top: 0.15rem;
`;

export const Message = styled(Card)`
  padding: 1.5rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.9rem;
`;

export const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const SummaryLabel = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
`;

export const SummaryValue = styled.div`
  font-size: 1.35rem;
  font-weight: 700;
  margin-top: 0.2rem;
  color: ${(props) => props.$color || "#111827"};
`;

/* ================= BADGE ================= */

const BADGE_TONES = {
  green: { background: "#ecfdf5", color: "#065f46", border: "#6ee7b7" },
  yellow: { background: "#fffbeb", color: "#92400e", border: "#fcd34d" },
  red: { background: "#fef2f2", color: "#991b1b", border: "#fca5a5" },
  blue: { background: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  gray: { background: "#f3f4f6", color: "#4b5563", border: "#d1d5db" },
  purple: { background: "#f5f3ff", color: "#5b21b6", border: "#c4b5fd" },
};

export const Badge = styled.span`
  display: inline-block;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  white-space: nowrap;
  background: ${(props) => (BADGE_TONES[props.$tone] || BADGE_TONES.gray).background};
  color: ${(props) => (BADGE_TONES[props.$tone] || BADGE_TONES.gray).color};
  border: 1px solid ${(props) => (BADGE_TONES[props.$tone] || BADGE_TONES.gray).border};
`;

/* ================= FORMULÁRIO ================= */

export const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border-radius: 999px;
  padding: 0.45rem 0.9rem;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  background: ${(props) => (props.$variant === "outline" ? "#fff" : props.$variant === "danger" ? "#dc2626" : "#111827")};
  color: ${(props) => (props.$variant === "outline" ? "#111827" : "#fff")};
  border: 1px solid ${(props) => (props.$variant === "outline" ? "#d1d5db" : props.$variant === "danger" ? "#dc2626" : "#111827")};

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

// Botão pequeno só com ícone, para as ações das linhas da tabela
export const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: ${(props) => props.$color || "#374151"};
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #f3f4f6;
  }

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

export const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.78rem;
  color: #374151;
  font-weight: 500;
`;

export const Input = styled.input`
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  padding: 0.5rem 0.6rem;
  font-size: 0.85rem;
  background: #fff;
  min-width: 0;
`;

export const Select = styled.select`
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  padding: 0.5rem 0.6rem;
  font-size: 0.85rem;
  background: #fff;
  min-width: 0;
`;

export const FilterBar = styled(Card)`
  display: grid;
  grid-template-columns: 2fr repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

/* ================= MODAL ================= */

export function Modal({ open, title, onClose, children, footer }) {
  if (!open) return null;
  return (
    <Overlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h3>{title}</h3>
          <IconButton onClick={onClose} aria-label="Fechar">
            <X size={16} />
          </IconButton>
        </ModalHeader>
        <ModalBody>{children}</ModalBody>
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalBox>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
`;

const ModalBox = styled.div`
  background: #fff;
  border-radius: 0.75rem;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f3f4f6;

  h3 {
    margin: 0;
    font-size: 1.05rem;
    color: var(--color-dark);
  }
`;

const ModalBody = styled.div`
  padding: 1rem 1.25rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.85rem 1.25rem;
  border-top: 1px solid #f3f4f6;
`;

/* ================= FORMATAÇÃO ================= */

export const formatMoney = (value) =>
  Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const formatNumber = (value) => Number(value || 0).toLocaleString("pt-BR");

// "yyyy-MM-dd" ou "yyyy-MM-ddTHH:mm..." para "dd/MM/yyyy"
export const formatDate = (value) => {
  if (!value) return "-";
  const [year, month, day] = value.slice(0, 10).split("-");
  return year && month && day ? `${day}/${month}/${year}` : "-";
};

// Mensagem de erro amigável a partir da resposta do backend
export const errorMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.message) return data.message;
  return fallback;
};
