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
  margin-top: 16px;
  gap: 8px;
`;

const PageButton = styled.button`
  padding: 6px 12px;
  border: 1px solid #ccc;
  background-color: ${({ active }) =>
    active ? "#6a5acd0a" : "white"};
  cursor: pointer;
  font-size: 14px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
