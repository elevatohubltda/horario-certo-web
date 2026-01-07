import styled from "styled-components";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

const getVisiblePages = (currentPage, totalPages) => {
  const maxVisible = 5;

  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, "ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, "ellipsis", totalPages - 2, totalPages - 1, totalPages];
  }
  return [
    1,
    "ellipsis",
    currentPage,
    "ellipsis",
    totalPages
  ];
};

export function PaginationControl({
  currentPage,
  totalPages,
  onPageChange
}) {
  if (totalPages <= 1) return null;

  return (
    <Pagination>
      <PageButton
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        <ChevronLeftIcon size={16} />
      </PageButton>

      {getVisiblePages(currentPage, totalPages).map((page, index) =>
        page === "ellipsis" ? (
          <PageButton key={`e-${index}`} disabled>
            …
          </PageButton>
        ) : (
          <PageButton
            key={page}
            active={page === currentPage}
            onClick={() => onPageChange(page)}
          >
            {page}
          </PageButton>
        )
      )}

      <PageButton
        onClick={() =>
          onPageChange(Math.min(totalPages, currentPage + 1))
        }
        disabled={currentPage === totalPages}
      >
        <ChevronRightIcon size={16} />
      </PageButton>
    </Pagination>
  );
}

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 24px;
  gap: 8px;
`;

const PageButton = styled.button`
  min-width: 36px;
  height: 36px;
  padding: 0 12px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 6px;
  border: 1px solid var(--color-olive);

  background-color: ${({ active }) =>
    active ? "var(--color-sage)" : "transparent"};

  color: ${({ active }) =>
    active ? "#fff" : "var(--color-dark)"};

  cursor: pointer;
  font-size: 13px;
  font-weight: ${({ active }) => (active ? "600" : "400")};

  transition: background-color 0.2s ease, color 0.2s ease,
    border-color 0.2s ease;

  svg {
    color: inherit;
  }

  &:hover:not(:disabled) {
    background-color: ${({ active }) =>
      active ? "var(--color-sage)" : "rgba(142, 152, 142, 0.2)"};
    border-color: var(--color-sage);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;