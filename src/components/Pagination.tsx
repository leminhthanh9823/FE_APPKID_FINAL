import React from "react";

interface PaginationProps {
  totalPage: number;
  currentPage?: number;
  pageSize: number;
  numOfRecords: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  customPageSizes?: number[];
}

const Pagination: React.FC<PaginationProps> = ({
  pageSize,
  numOfRecords,
  currentPage = 1,
  onPageChange,
  onPageSizeChange,
  totalPage,
  customPageSizes
}) => {
  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    const pages: (number | string)[] = [];

    if (totalPage <= maxPagesToShow) {
      return Array.from({ length: totalPage }, (_, i) => i + 1);
    }

    const half = Math.floor(maxPagesToShow / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPage, start + maxPagesToShow - 1);

    if (end - start + 1 < maxPagesToShow) {
      start = Math.max(1, end - maxPagesToShow + 1);
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPage) {
      if (end < totalPage - 1) pages.push('...');
      pages.push(totalPage);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="row g-0 align-items-center pb-4">
      <div className="col-sm-6 d-flex align-items-center">
        <p className="mb-sm-0 me-2">Display</p>
        <select
          className="form-select"
          value={pageSize}
          onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
          style={{ width: "80px" }}
        >
          {(customPageSizes ? customPageSizes : [5, 10, 20, 50, 100, 300]).map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <p className="mb-sm-0 ms-2">out of total {numOfRecords} records.</p>
      </div>
      <div className="col-sm-6">
        <div className="float-sm-end">
          <ul className="pagination mb-sm-0">
            <li
              className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              onClick={currentPage > 1 ? () => onPageChange?.(currentPage - 1) : undefined}
            >
              <a href="#" className="page-link">
                <i className="bi bi-arrow-left-short"></i>
              </a>
            </li>

            {pageNumbers.map((page, index) =>
              typeof page === "number" ? (
                <li
                  key={index}
                  className={`page-item ${page === currentPage ? "active" : ""}`}
                  onClick={() => onPageChange?.(page)}
                >
                  <a href="#" className="page-link">
                    {page}
                  </a>
                </li>
              ) : (
                <li key={index} className="page-item disabled">
                  <span className="page-link">...</span>
                </li>
              )
            )}

            <li
              className={`page-item ${currentPage === totalPage ? "disabled" : ""}`}
              onClick={currentPage < totalPage ? () => onPageChange?.(currentPage + 1) : undefined}
            >
              <a href="#" className="page-link">
                <i className="bi bi-arrow-right-short"></i>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
