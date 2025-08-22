import React, { useCallback, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import '../styles/styleTable.css';
import ConfirmModal from './ui/ConfirmModal';
import EditModal from './ui/EditModal';
import CreateModal from './ui/CreateModal';
import TableLoading from './TableLoading';
import Field from '../types/field';
import { CustomAction } from '@/types/customAction';
import { QRCode } from 'antd';
import { buildRoute } from '@/utils/helper/routeHelper';

interface TableProps<T extends Record<string, any>> {
  customView?: React.ReactNode;
  tableName?: string;
  columns: {
    key: keyof T;
    label: string;
    width?: string;
    format?: (value: any) => React.ReactNode;
  }[];
  data: T[];
  editFields?: Field[];
  createFields?: Field[];
  isEditable?: boolean;
  isDeletable?: boolean;
  isImportable?: boolean;
  isCreatable?: boolean;
  customCreate?: CustomAction;
  isSearchable?: boolean;
  trueLabel?: string;
  falseLabel?: string;
  onSearch?: (searchTerm: string) => void;
  endpoint: string;
  customActions?: CustomAction[];
  customDeleteUrl?: string;
  customDeleteMethod?: string;
  filterData?: { key: string; value: string }[];
  isFilterable?: boolean;
  setFilterField?: (field: string) => void;
  defaultFilterOption?: string;
  startDate?: string;
  endDate?: string;
  setStartDate?: (date: string) => void;
  setEndDate?: (date: string) => void;
  isDateFilterable?: boolean;
  isExportable?: boolean;
  onSelectRow?: (row: any) => void;
  selectedIds?: number[];
  keyId?: string;
  handleClearSelection?: () => void;
  isToggleable?: boolean;
  onToggleStatus?: (
    id: number | string,
    currentStatus: boolean
  ) => Promise<boolean>;
  prepareEditFields?: (item: any, fields: Field[]) => Field[];
  isTableLoading?: boolean;
  loadingMessage?: string;
}

const Table: React.FC<TableProps<any>> = ({
  customView,
  tableName,
  columns,
  data,
  createFields = [],
  editFields = [],
  isEditable = true,
  isSearchable = true,
  isDeletable = true,
  onSearch,
  trueLabel = 'Active',
  falseLabel = 'Inactive',
  endpoint,
  isImportable = true,
  isCreatable = false,
  customCreate,
  customActions,
  customDeleteMethod,
  customDeleteUrl,
  filterData = [],
  isFilterable = false,
  setFilterField,
  defaultFilterOption,
  startDate,
  endDate,
  setEndDate,
  setStartDate,
  isDateFilterable = false,
  isExportable = false,
  onSelectRow,
  selectedIds = [],
  keyId = 'id',
  handleClearSelection,
  isToggleable = false,
  onToggleStatus,
  prepareEditFields,
  isTableLoading = false,
  loadingMessage = 'Loading data...',
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [message, setMessage] = useState('');
  const [qrData, setQrData] = useState<string | null>(null);
  const [editField, setEditField] = useState<Field[]>(editFields);
  const [createField, setCreateField] = useState<Field[]>(createFields);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [createTitle, setCreateTitle] = useState('Create new');
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: 'asc' | 'desc' | null;
  }>({ key: null, direction: null });

  const closeConfirmModal = () => setShowConfirmModal(false);
  const closeEditModal = () => setShowEditModal(false);
  const closeImportModal = () => setShowImportModal(false);
  const closeExportModal = () => setShowExportModal(false);
  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCreateTitle('Create new');
    setSelectedItem(null);
  };

  const handleDelete = (item: any) => {
    setShowConfirmModal(true);
    setMessage('Are you sure you want to delete this item?');
    setSelectedItem(item);
  };

  const handleEdit = (item: any) => {
    setShowEditModal(true);
    let mapFields;

    if (prepareEditFields) {
      // Use the custom prepareEditFields function if provided
      mapFields = prepareEditFields(item, editFields);
    } else {
      // Use default mapping logic
      mapFields = editFields.map((ef) => ({
        ...ef,
        value: item[ef.name] ?? '',
        options: ef.options ? [...ef.options] : [],
      }));
    }

    setEditField(mapFields);
    setSelectedItem(item);
  };

  const handleImport = () => setShowImportModal(true);
  const handleExport = () => setShowExportModal(true);

  const handleToggleStatus = async (item: any) => {
    if (onToggleStatus) {
      const currentStatus =
        item.is_active !== undefined ? item.is_active : item.status;
      const success = await onToggleStatus(item[keyId], currentStatus);
      if (success) {
        // Optionally refresh data or update local state here
      }
    }
  };

  const handleCreate = () => {
    if (customCreate && customCreate.link) {
      if (typeof customCreate.link === 'string') {
        window.location.href = customCreate.link;
      } else if (typeof customCreate.link === 'function') {
        window.location.href = customCreate.link(null);
      }
      return;
    }
    setSelectedItem(null);
    setCreateTitle('Create new');
    setShowCreateModal(true);
    const addFields = createFields.map((ef) => ({
      ...ef,
      options: ef.options ? [...ef.options] : [],
    }));
    setCreateField(addFields);
  };

  const handleCustomAction = (action: CustomAction, item: any) => {
    setCreateTitle(action?.action || 'Create new');
    if (action?.link) {
      const finalUrl =
        typeof action.link === 'function' ? action.link(item) : action.link;
      window.location.href = finalUrl;
    }
  };

  const handleSearch = () => {
    onSearch && onSearch(searchTerm);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = () => {
    if (!sortConfig.key || !sortConfig.direction) return data;

    const sortedData = [...data];
    sortedData.sort((a, b) => {
      const valueA = a[sortConfig.key!];
      const valueB = b[sortConfig.key!];

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortConfig.direction === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
      if (valueA < valueB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sortedData;
  };

  const formatNumber = (value: any) => {
    if (typeof value === 'number' && !isNaN(value)) {
      return value.toLocaleString('vi-VN');
    }
    return value;
  };

  const importField: Field[] = [
    {
      name: 'fileId',
      label: 'File ID',
      type: 'text',
      value: '',
      rowGroup: '1',
      colSpan: 12,
    },
    {
      name: 'sheetId',
      label: 'Sheet ID',
      type: 'text',
      value: '',
      rowGroup: '1',
      colSpan: 12,
    },
  ];

  const exportField: Field[] = [
    {
      name: 'googleSheetId',
      label:
        'Sheet ID (Copy và paste link google sheet vào ô dưới đây sheet ID sẽ được tự động lấy)',
      type: 'text',
      value: '',
      rowGroup: '1',
      colSpan: 12,
      isRequired: true,
    },
    {
      name: 'sheetName',
      label: 'Tên sheet',
      type: 'text',
      value: '',
      rowGroup: '2',
      colSpan: 6,
      isRequired: true,
    },
    {
      name: 'startCell',
      label: 'Ô khởi đầu',
      type: 'text',
      value: '',
      rowGroup: '2',
      colSpan: 6,
      isRequired: true,
    },
    {
      name: 'startDate',
      label: 'Ngày bắt đầu',
      type: 'date',
      value: '',
      rowGroup: '3',
      colSpan: 6,
      isRequired: true,
    },
    {
      name: 'endDate',
      label: 'Ngày kết thúc',
      type: 'date',
      value: '',
      rowGroup: '3',
      colSpan: 6,
      isRequired: true,
    },
  ];

  const sortedData = getSortedData();

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const animationFrameRef = useRef<number | null>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button === 2) {
      e.preventDefault();
      setIsDragging(true);
      if (tableContainerRef.current) {
        setStartX(e.pageX - tableContainerRef.current.offsetLeft);
        setScrollLeft(tableContainerRef.current.scrollLeft);
      }
    }
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDragging || !tableContainerRef.current) return;
      e.preventDefault();

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        if (!tableContainerRef.current) return;
        const x = e.pageX - tableContainerRef.current.offsetLeft;
        const walk = (x - startX) * -1;
        tableContainerRef.current.scrollLeft = scrollLeft + walk;
      });
    },
    [isDragging, startX, scrollLeft]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  // ERROR: LỖI SAU KHI QUA HÀM NÀY THÌ CÁC VALUE IS_ACTIVE từ 1 -> true
  const patchedFields = editFields.map((field) => {
    const key = field.camelName || field.name;
    let value = selectedItem?.[key] ?? '';

    return {
      ...field,
      value,
    };
  });
  return (
    <>
      <div className="row align-items-center">
        <h5 className="mb-2">{tableName}</h5>
        <div className="col-md-12 d-flex align-items-center justify-content-end gap-2 mb-3">
           {customView && (
            customView
          )}
          {handleClearSelection && (
            <button
              className="btn btn-secondary"
              onClick={handleClearSelection}
            >
              Clear Selection
            </button>
          )}
          {isSearchable && (
            <div className="input-group" style={{ maxWidth: '300px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search..."
                aria-label="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={handleSearch}
              >
                <i className="bi bi-search"></i>
              </button>
            </div>
          )}
          {isCreatable && (
            <button className="btn btn-primary" onClick={handleCreate}>
              <i className="bx bx-plus me-1"></i> Create new
            </button>
          )}
          {isImportable && (
            <button className="btn btn-primary" onClick={handleImport}>
              <i className="bx bx-plus me-1"></i> Import
            </button>
          )}
          {isExportable && (
            <button className="btn btn-primary" onClick={handleExport}>
              <i className="bx bx-plus me-1"></i> Export
            </button>
          )}
        </div>
      </div>
      <div className="row">
        <div className="col-lg-12">
          <div
            ref={tableContainerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onContextMenu={(e) => e.preventDefault()}
            className="table-responsive"
            style={{
              cursor: isDragging ? 'grabbing' : 'grab',
              position: 'relative',
            }}
          >
            <TableLoading
              isTableLoading={isTableLoading}
              message={loadingMessage}
            />
            <table className="table project-list-table table-nowrap align-middle table-borderless">
              <thead>
                <tr>
                  {/* <th scope="col" className="ps-4" style={{ width: "50px", minWidth: "50px" }}>
                    <input type="checkbox" className="form-check-input" />
                  </th> */}
                  {onSelectRow && (
                    <th scope="col" style={{ width: '50px', minWidth: '50px' }}>
                      Select
                    </th>
                  )}
                  {columns.map((col, index) => (
                    <th
                      key={index}
                      style={{
                        width: col.width || 'auto',
                        minWidth: col.width || '100px',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleSort(col.key as string)}
                    >
                      {col.label}
                      {sortConfig.key === col.key && (
                        <span>
                          {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                        </span>
                      )}
                    </th>
                  ))}
                  {(isDeletable || isEditable || customActions) && (
                    <th
                      scope="col"
                      style={{ width: '100px', minWidth: '100px' }}
                    >
                      Action
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {sortedData.map((item, rowIndex) => (
                  <tr key={rowIndex}>
                    {/* <th scope="row" className="ps-4" style={{ width: "50px", minWidth: "50px" }}>
                      <div className="form-check font-size-16">
                        <input type="checkbox" className="form-check-input" id={`contacusercheck${rowIndex}`} />
                        <label className="form-check-label" htmlFor={`contacusercheck${rowIndex}`}></label>
                      </div>
                    </th> */}
                    {onSelectRow && (
                      <td style={{ width: '50px', minWidth: '50px' }}>
                        <div className="form-check font-size-16">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={
                              selectedIds && selectedIds.includes(item[keyId])
                            }
                            id={`selectRow${rowIndex}`}
                            onChange={() => onSelectRow(item)}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`selectRow${rowIndex}`}
                          ></label>
                        </div>
                      </td>
                    )}
                    {columns.map((col, colIndex) => (
                      <td
                        key={colIndex}
                        style={{
                          width: col.width || 'auto',
                          minWidth: col.width || '100px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {isToggleable &&
                        (col.key === 'is_active' || col.key === 'status') ? (
                          <div className="d-flex">
                            <button
                              className={`btn btn-sm rounded-pill position-relative border-0 ${
                                item[col.key] ? 'bg-success' : 'bg-secondary'
                              }`}
                              onClick={() => handleToggleStatus(item)}
                              title={`Change to ${item[col.key] ? falseLabel : trueLabel}`}
                              style={{
                                width: '40px',
                                height: '20px',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                padding: '0',
                              }}
                            >
                              <div
                                className="rounded-circle bg-white position-absolute"
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  top: '2px',
                                  left: item[col.key] ? '21px' : '3px',
                                  transition: 'left 0.3s ease',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                }}
                              ></div>
                            </button>
                          </div>
                        ) : col.format ? (
                          col.format(item[col.key])
                        ) : typeof item[col.key] === 'boolean' ? (
                          item[col.key] ? (
                            <span className="badge bg-success">
                              {trueLabel}
                            </span>
                          ) : (
                            <span className="badge bg-danger">
                              {falseLabel}
                            </span>
                          )
                        ) : (
                          item[col.key]
                        )}
                      </td>
                    ))}
                    {(isDeletable || isEditable || customActions) && (
                      <td style={{ width: '100px', minWidth: '100px' }}>
                        <ul className="list-inline mb-0">
                          {isEditable && (
                            <li className="list-inline-item">
                              <a
                                data-bs-toggle="tooltip"
                                data-bs-placement="top"
                                title="Edit"
                                className="px-2 text-primary"
                                onClick={() => handleEdit(item)}
                              >
                                <i className="bi bi-pencil-square font-size-18"></i>
                              </a>
                            </li>
                          )}
                          {customActions && (
                            <li className="filter list-inline-item">
                              <a
                                className="icon"
                                href="#"
                                data-bs-toggle="dropdown"
                                // aria-expanded="false"
                              >
                                <i className="bi bi-three-dots"></i>
                              </a>
                              <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow">
                                {customActions.map((action, index) => (
                                  <li key={index}>
                                    <a
                                      className="dropdown-item"
                                      style={{ cursor: 'pointer' }}
                                      onClick={() =>
                                        handleCustomAction(action, item)
                                      }
                                    >
                                      {action.action}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </li>
                          )}
                        </ul>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {qrData && (
        <>
          <div
            className="modal fade show d-block"
            tabIndex={-1}
            role="dialog"
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1050,
            }}
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">QR Code</h5>
                </div>
                <div className="modal-body d-flex justify-content-center">
                  <QRCode value={qrData} size={200} />
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setQrData(null)}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <ConfirmModal
        showModal={showConfirmModal}
        message={message}
        onClose={closeConfirmModal}
        selectedItemId={
          selectedItem?.id ||
          selectedItem?.user_id ||
          selectedItem?.role_id ||
          selectedItem?.transfer_plan_id ||
          selectedItem?.ledger_id ||
          selectedItem?.vehicle_id ||
          selectedItem?.scan_id
        }
        endpoint={endpoint}
        customUrl={customDeleteUrl}
        customMethod={customDeleteMethod}
        data={{
          driverId: selectedItem?.driver_id,
          vehicleId: selectedItem?.vehicle_id,
        }}
      />
      <EditModal
        title="Edit"
        showModal={showEditModal}
        fields={patchedFields}
        onClose={closeEditModal}
        selectedItemId={
          selectedItem?.id ||
          selectedItem?.user_id ||
          selectedItem?.role_id ||
          selectedItem?.transfer_plan_id ||
          selectedItem?.ledger_id ||
          selectedItem?.vehicle_id ||
          selectedItem?.scan_id
        }
        endpoint={endpoint}
      />
      <EditModal
        title="Thêm dữ liệu từ Google Sheet"
        showModal={showImportModal}
        fields={importField}
        onClose={closeImportModal}
        endpoint={endpoint}
      />
      <EditModal
        title="Xuất dữ liệu ra Google Sheet"
        showModal={showExportModal}
        fields={exportField}
        onClose={closeExportModal}
        endpoint={endpoint}
        isExport={true}
      />
      <CreateModal
        title={createTitle}
        showModal={showCreateModal}
        fields={createField}
        onClose={closeCreateModal}
        endpoint={endpoint}
        id={selectedItem?.user_id}
      />
    </>
  );
};

export default Table;
