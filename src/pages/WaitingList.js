import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import Topbar from "../components/topbar";
import Sidebar from "../components/sidebar";
import { Title } from "../components/title";
import { Separator } from "../components/separator/style";
import { CustomFilterStyle } from "../components/filter/style";
import DateRangeSelector from "../components/dateRangeSelector";
import { getWaitingQueue, deleteWaitingQueueEntry } from "../services/endpoints/waitingQueue";
import { getCompany } from "../services/endpoints/company";
import { isAvailableLogin } from "../util/auth";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { Phone, MessageCircle, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";

/* ─── Tabela ─── */

const TableWrapper = styled.div`
  padding: 0 1rem 1rem;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
`;

const Th = styled.th`
  text-align: left;
  padding: 0.6rem 0.75rem;
  color: var(--color-olive);
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 0.7rem 0.75rem;
  color: var(--color-dark);
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
`;

const Tr = styled.tr`
  &:hover td { background-color: #fafaf8; }
`;

/* ─── Ações ─── */

const Actions = styled.div`
  display: flex;
  gap: 0.4rem;
`;

const IconButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  text-decoration: none;
  background-color: ${({ $color }) => $color || "var(--color-sage)"};
  color: #fff;
  transition: opacity 0.2s;
  flex-shrink: 0;
  &:hover { opacity: 0.82; }
`;

const DeleteButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  background-color: #fee2e2;
  color: #ef4444;
  transition: background-color 0.2s;
  &:hover { background-color: #fecaca; }
`;

/* ─── Paginação ─── */

const PaginationRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem 0;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const PaginationInfo = styled.span`
  font-size: 0.8rem;
  color: var(--color-olive);
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const PageButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: 1px solid ${({ $active }) => $active ? "var(--color-sage)" : "#e5e7eb"};
  background-color: ${({ $active }) => $active ? "var(--color-sage)" : "transparent"};
  color: ${({ $active }) => $active ? "#fff" : "var(--color-dark)"};
  cursor: ${({ disabled }) => disabled ? "default" : "pointer"};
  opacity: ${({ disabled }) => disabled ? 0.4 : 1};
  font-size: 0.8rem;
  &:hover:not(:disabled) {
    background-color: ${({ $active }) => $active ? "var(--color-sage)" : "#f3f4f6"};
  }
`;

const PerPageSelect = styled.select`
  height: 30px;
  padding: 0 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.8rem;
  color: var(--color-dark);
  background: transparent;
  cursor: pointer;
`;

const EmptyState = styled.p`
  color: var(--color-olive);
  font-size: 0.9rem;
  text-align: center;
  margin: 3rem 0;
`;

/* ─── helpers de data ─── */

const today = () => new Date().toISOString().split("T")[0];
const addDays = (base, days) => {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};

/* ═══════════════════════════════════════════════════════ */

export default function WaitingList() {
  const navigate = useNavigate();
  const companyUrl = Cookies.get("companyUrl");

  const [companyInfo, setCompanyInfo] = useState(null);
  const [entries, setEntries] = useState([]);

  const [filter, setFilter] = useState({
    indexActive: 0,
    startDate: today(),
    endDate: addDays(today(), 2),
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    if (!isAvailableLogin()) { navigate("/login"); return; }
    getCompany(companyUrl).then(r => setCompanyInfo(r.data)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    getWaitingQueue(filter.startDate, filter.endDate)
      .then(r => setEntries(r.data || []))
      .catch(() => toast.error("Erro ao carregar a lista de espera."));
  }, [filter]);

  const handleDelete = async (id) => {
    try {
      await deleteWaitingQueueEntry(id);
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch {
      toast.error("Erro ao remover da fila.");
    }
  };

  const handleFilter = (indexActive, startDate, endDate) => {
    setFilter({ indexActive, startDate, endDate });
  };

  /* posição de cada entrada dentro do seu dia */
  const entriesWithPosition = useMemo(() => {
    const countByDate = {};
    return entries.map(entry => {
      countByDate[entry.date] = (countByDate[entry.date] || 0) + 1;
      return { ...entry, position: countByDate[entry.date] };
    });
  }, [entries]);

  const totalPages = Math.max(1, Math.ceil(entriesWithPosition.length / perPage));
  const paginated = entriesWithPosition.slice((currentPage - 1) * perPage, currentPage * perPage);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1);

  const formatPhone = (raw) => raw.replace(/\D/g, "");

  return (
    <>
      <Topbar
        name={companyInfo?.name}
        imagem={companyInfo?.imagem}
        whatsapp={companyInfo?.whatsapp}
        instagram={companyInfo?.instagram}
      />
      <Sidebar>
        <Title
          $padding="1rem"
          $margin="1rem 0 0 0"
          $fontweight="600"
          $color="var(--color-brown)"
          $width="max-content"
        >
          Lista de Espera
        </Title>
        <Separator
          $width="calc(100% - 2rem)"
          $bordercolor="var(--color-olive)"
          $margin="0 1rem 0 1rem"
        />

        {/* ─── Filtro de data ─── */}
        <CustomFilterStyle $margin="0" $padding="0.75rem 1rem" $width="calc(100% - 2rem)">
          <button
            className={filter.indexActive === 0 ? "active filter-button" : "filter-button"}
            onClick={() => handleFilter(0, today(), addDays(today(), 2))}
          >
            3 dias
          </button>
          <button
            className={filter.indexActive === 1 ? "active filter-button" : "filter-button"}
            onClick={() => handleFilter(1, today(), addDays(today(), 6))}
          >
            7 dias
          </button>
          <DateRangeSelector
            isActive={filter.indexActive === 2}
            onChangeRange={({ startDate, endDate }) =>
              handleFilter(
                2,
                new Date(startDate).toISOString().split("T")[0],
                new Date(endDate).toISOString().split("T")[0]
              )
            }
          />
        </CustomFilterStyle>

        {/* ─── Tabela ─── */}
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th style={{ width: "3rem" }}>#</Th>
                <Th>Data</Th>
                <Th>Nome</Th>
                <Th style={{ width: "7rem" }}>Ações</Th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <EmptyState>Nenhum cliente na fila de espera para o período selecionado.</EmptyState>
                  </td>
                </tr>
              ) : (
                paginated.map(entry => {
                  const digits = formatPhone(entry.telephone);
                  return (
                    <Tr key={entry.id}>
                      <Td style={{ color: "var(--color-olive)", fontSize: "0.8rem" }}>
                        {entry.position}º
                      </Td>
                      <Td style={{ whiteSpace: "nowrap" }}>{entry.date}</Td>
                      <Td>{entry.name}</Td>
                      <Td>
                        <Actions>
                          <IconButton
                            href={`https://wa.me/55${digits}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            $color="#25d366"
                            title="Abrir no WhatsApp"
                          >
                            <MessageCircle size={14} />
                          </IconButton>
                          <IconButton href={`tel:+55${digits}`} $color="#4a7c59" title="Ligar">
                            <Phone size={14} />
                          </IconButton>
                          <DeleteButton onClick={() => handleDelete(entry.id)} title="Remover da fila">
                            <Trash2 size={14} />
                          </DeleteButton>
                        </Actions>
                      </Td>
                    </Tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </TableWrapper>

        {/* ─── Paginação ─── */}
        {entriesWithPosition.length > 0 && (
          <PaginationRow>
            <PaginationInfo>
              {entriesWithPosition.length} registro{entriesWithPosition.length !== 1 ? "s" : ""} •{" "}
              Página {currentPage} de {totalPages}
            </PaginationInfo>

            <PaginationControls>
              <label style={{ fontSize: "0.8rem", color: "var(--color-olive)" }}>Por página:</label>
              <PerPageSelect
                value={perPage}
                onChange={e => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
              >
                {[5, 10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
              </PerPageSelect>

              <PageButton
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={14} />
              </PageButton>

              {pageNumbers.map((p, i) => {
                const prev = pageNumbers[i - 1];
                return (
                  <React.Fragment key={p}>
                    {prev && p - prev > 1 && (
                      <span style={{ fontSize: "0.8rem", color: "var(--color-olive)" }}>…</span>
                    )}
                    <PageButton $active={p === currentPage} onClick={() => setCurrentPage(p)}>
                      {p}
                    </PageButton>
                  </React.Fragment>
                );
              })}

              <PageButton
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={14} />
              </PageButton>
            </PaginationControls>
          </PaginationRow>
        )}
      </Sidebar>
      <ToastContainer position="top-right" autoClose={3000} closeButton={false} />
    </>
  );
}
