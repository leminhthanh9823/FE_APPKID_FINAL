import React from 'react';
import '../styles/styleLoading.css';

interface TableLoadingProps {
  message?: string;
  isTableLoading?: boolean;
}

const TableLoading: React.FC<TableLoadingProps> = ({
  message = 'Loading data...',
  isTableLoading = false,
}) => {
  if (isTableLoading) {
    return (
      <div className="table-loading-overlay">
        <div className="table-loading-content">
          <div className="table-spinner"></div>
          <p className="table-loading-text">{message}</p>
        </div>
      </div>
    );
  }

  return null;
};

export default TableLoading;
