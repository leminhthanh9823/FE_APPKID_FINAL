import { useEffect, useState, useRef } from 'react';
import '../../styles/modalTransition.css';
import { CSSTransition } from 'react-transition-group';
import Field from '../../types/field';
import useEditItem from '../../hooks/useEditItem';
import { toast } from 'react-toastify';
import useImportItem from '../../hooks/useImportItem';
import { ENDPOINT } from '@/routers/endpoint';
import { formatMessage, MESSAGE } from '@/utils/constants/errorMessage';
import Select from 'react-select';
interface EditModalProps {
  title: string;
  showModal: boolean;
  onClose: () => void;
  fields: Field[];
  selectedItemId?: string;
  endpoint: string;
  isExport?: boolean;
}

const EditModal: React.FC<EditModalProps> = ({
  title,
  showModal,
  onClose,
  fields,
  selectedItemId,
  endpoint,
  isExport = false,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  let url = `${endpoint}/get-from-sheet`;
  if (selectedItemId) {
    url = `${endpoint}/edit/${selectedItemId}`;
  }
  if (isExport) {
    url = `${endpoint}/export-to-sheet`;
  }
  const { error, saveChanges } = useEditItem(url, formData);
  const { error: importErr, saveChanges: importSave } = useImportItem(
    url,
    formData
  );

  const handleSave = async () => {
    const dataToSend = { ...formData };
    let newErrors: Record<string, string> = {};
    fields.forEach((field) => {
      const key = field.camelName ?? field.name;
      if (field.isRequired) {
        const value = formData[key];
        // Kiểm tra empty value một cách toàn diện
        const isEmpty =
          value === null ||
          value === undefined ||
          value === '' ||
          (Array.isArray(value) && value.length === 0);
        if (isEmpty) {
          newErrors[key] = formatMessage(MESSAGE.REQUIRED_FIELD, field.label);
        }
      }
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error(MESSAGE.MISSING_FIELD);
      return;
    }

    Object.keys(dataToSend).forEach((key) => {
      const field = fields.find((f) => f.camelName === key || f.name === key);
      if (field?.type === 'datetime-local' && dataToSend[key]) {
        dataToSend[key] = new Date(dataToSend[key]).toISOString();
      } else if (field?.type === 'select' && dataToSend[key]) {
        if (
          typeof dataToSend[key] === 'object' &&
          dataToSend[key] !== null &&
          'value' in dataToSend[key]
        ) {
          let extractedValue = dataToSend[key].value;

          if (
            field.name === 'is_active' ||
            field.name === 'grade_id' ||
            field.name === 'role_id'
          ) {
            extractedValue = Number(extractedValue);
          }

          dataToSend[key] = extractedValue;
        }
      } else if (
        field?.type === 'multi-select' &&
        Array.isArray(dataToSend[key])
      ) {
        dataToSend[key] = dataToSend[key].map((item: any) =>
          typeof item === 'object' && item.value !== undefined
            ? item.value
            : item
        );
      }
    });

    setFormData(dataToSend);
    let isSuccess = false;

    if (selectedItemId) {
      isSuccess = await saveChanges();
    } else {
      isSuccess = await importSave();
    }

    if (isSuccess) {
      toast.success(MESSAGE.UPDATE_SUCCESS);
      onClose();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user makes changes
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  useEffect(() => {
    if (showModal) {
      const initialData = Object.fromEntries(
        fields.map((f) => {
          const key = f.camelName || f.name;
          let value = f.value;
          if (f.type === 'number' && (value === '' || value === null)) {
            value = null;
          } else if (f.type === 'select' && f.options) {
            const matchedOption = f.options.find((opt) => opt.value === value);
            value = matchedOption || null;
          } else if (f.type === 'multi-select') {
            if (Array.isArray(value)) {
              value = value.map((item) =>
                typeof item === 'object' && item !== null && 'id' in item
                  ? item.id
                  : item
              );
            } else if (
              typeof value === 'object' &&
              value !== null &&
              'id' in value
            ) {
              value = [value.id];
            } else if (value !== null && value !== undefined && value !== '') {
              value = [value];
            } else {
              value = [];
            }
          } else if (f.type === 'checkbox' && Array.isArray(f.value)) {
            value = f.value;
          } else if (f.type === 'datetime-local' && value) {
            const date = new Date(value);
            value = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
              .toISOString()
              .slice(0, 16);
          }

          return [key, value];
        })
      );
      setFormData(initialData);
    }
  }, [showModal, selectedItemId]);

  const groupedFields = fields.reduce<Record<string, Field[]>>((acc, field) => {
    const group = field.rowGroup ?? field.name;
    if (!acc[group]) acc[group] = [];
    acc[group].push(field);
    return acc;
  }, {});

  const extractSheetId = (url: string): string => {
    try {
      const match = url.match(/\/d\/([a-zA-Z0-9-_]+)\//);
      return match ? match[1] : '';
    } catch {
      return '';
    }
  };

  return (
    <>
      <CSSTransition
        in={showModal}
        timeout={300}
        classNames="modal"
        unmountOnExit
        nodeRef={modalRef}
      >
        <div
          ref={modalRef}
          className="modal fade show d-block"
          tabIndex={-1}
          role="dialog"
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{title}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={onClose}
                ></button>
              </div>
              <div className="modal-body">
                {isExport && (
                  <div className="alert alert-info" role="alert">
                    <strong>Chú ý:</strong> Nếu bạn muốn xuất dữ liệu tới google
                    sheet hãy chia sẻ quyền Editor của sheet đó cho email sau
                    gsheet@truong-nam-logistics-455607.iam.gserviceaccount.com
                  </div>
                )}
                <form>
                  {Object.entries(groupedFields).map(([group, fieldsInRow]) => (
                    <div className="row mb-3" key={group}>
                      {fieldsInRow.map((field) => (
                        <div
                          key={field.name}
                          className={`col-${field.colSpan ?? 6}`}
                        >
                          <label className="form-label">
                            {field.label}
                            {field.isRequired && (
                              <span style={{ color: 'red', marginLeft: '4px' }}>
                                *
                              </span>
                            )}
                          </label>
                          {field.type === 'text' || field.type === 'number' ? (
                            <input
                              type={field.type}
                              className="form-control"
                              value={
                                formData[field.camelName || field.name] || ''
                              }
                              onChange={(e) =>
                                handleChange(
                                  field.camelName || field.name,
                                  field.name === 'googleSheetId'
                                    ? extractSheetId(e.target.value)
                                    : e.target.value
                                )
                              }
                            />
                          ) : field.type === 'textarea' ? (
                            <textarea
                              className="form-control"
                              value={
                                formData[field.camelName || field.name] || ''
                              }
                              onChange={(e) =>
                                handleChange(
                                  field.camelName || field.name,
                                  e.target.value
                                )
                              }
                            />
                          ) : field.type === 'password' ? (
                            <input
                              type="password"
                              className="form-control"
                              value={
                                formData[field.camelName || field.name] || ''
                              }
                              onChange={(e) =>
                                handleChange(
                                  field.camelName || field.name,
                                  e.target.value
                                )
                              }
                            />
                          ) : field.type === 'date' ? (
                            <input
                              type="date"
                              className="form-control"
                              value={
                                formData[field.camelName || field.name] || ''
                              }
                              onChange={(e) =>
                                handleChange(
                                  field.camelName || field.name,
                                  e.target.value
                                )
                              }
                            />
                          ) : field.type === 'datetime-local' ? (
                            <input
                              type="datetime-local"
                              className="form-control"
                              value={
                                formData[field.camelName || field.name] || ''
                              }
                              onChange={(e) =>
                                handleChange(
                                  field.camelName || field.name,
                                  e.target.value
                                )
                              }
                            />
                          ) : field.type === 'checkbox' ? (
                            field.options && field.options.length > 0 ? (
                              <div>
                                {field.options.map((option) => (
                                  <div
                                    className="form-check"
                                    key={option.value}
                                  >
                                    <input
                                      type="checkbox"
                                      className="form-check-input"
                                      checked={formData[
                                        field.camelName || field.name
                                      ]?.includes(option.value)}
                                      onChange={(e) => {
                                        const currentValues =
                                          formData[
                                            field.camelName || field.name
                                          ] || [];
                                        const newValue = e.target.checked
                                          ? [...currentValues, option.value]
                                          : currentValues.filter(
                                              (v: any) => v !== option.value
                                            );
                                        handleChange(
                                          field.camelName || field.name,
                                          newValue
                                        );
                                      }}
                                    />
                                    <label className="form-check-label">
                                      {option.label}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="form-check">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={
                                    formData[field.camelName || field.name] ||
                                    false
                                  }
                                  onChange={(e) =>
                                    handleChange(
                                      field.camelName || field.name,
                                      e.target.checked
                                    )
                                  }
                                />
                              </div>
                            )
                          ) : field.type === 'select' && field.options ? (
                            <Select
                              options={field.options}
                              value={formData[field.camelName || field.name]}
                              onChange={(selectedOption) => {
                                handleChange(
                                  field.camelName || field.name,
                                  selectedOption
                                );
                              }}
                              className="basic-multi-select"
                              classNamePrefix="select"
                              placeholder="Select options..."
                            />
                          ) : field.type === 'multi-select' && field.options ? (
                            <Select
                              options={field.options}
                              isMulti
                              value={field.options.filter((opt) =>
                                formData[
                                  field.camelName || field.name
                                ]?.includes(opt.value)
                              )}
                              onChange={(selectedOptions) =>
                                handleChange(
                                  field.camelName || field.name,
                                  selectedOptions.map((opt) => opt.value)
                                )
                              }
                              className="basic-multi-select"
                              classNamePrefix="select"
                              placeholder="Select options..."
                            />
                          ) : field.type === 'file' ? (
                            <>
                              <input
                                type="file"
                                className="form-control"
                                accept={field.fileAccept ?? '*'}
                                multiple={field.isFileMultiple ?? false}
                                onChange={(e) => {
                                  const files = e.target.files;
                                  if (!files) return;
                                  const value = field.isFileMultiple
                                    ? Array.from(files)
                                    : files[0];
                                  handleChange(
                                    field.camelName || field.name,
                                    value
                                  );
                                }}
                              />
                              {formData[field.camelName || field.name] &&
                                typeof formData[
                                  field.camelName || field.name
                                ] === 'string' && (
                                  <div className="mt-2">
                                    {formData[
                                      field.camelName || field.name
                                    ].match(/\.(jpeg|jpg|png|gif)$/i) ? (
                                      <img
                                        src={
                                          formData[
                                            field.camelName || field.name
                                          ]
                                        }
                                        alt="preview"
                                        style={{
                                          maxWidth: '100%',
                                          height: 'auto',
                                        }}
                                      />
                                    ) : formData[
                                        field.camelName || field.name
                                      ].match(/\.(mp4|webm)$/i) ? (
                                      <video controls width="100%">
                                        <source
                                          src={
                                            formData[
                                              field.camelName || field.name
                                            ]
                                          }
                                        />
                                        Trình duyệt không hỗ trợ video.
                                      </video>
                                    ) : (
                                      <a
                                        href={
                                          formData[
                                            field.camelName || field.name
                                          ]
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        📎{' '}
                                        {decodeURIComponent(
                                          formData[
                                            field.camelName || field.name
                                          ]
                                            .split('/')
                                            .pop() ?? 'Tập tin'
                                        )}
                                      </a>
                                    )}
                                  </div>
                                )}
                            </>
                          ) : null}
                          {errors[field.camelName ?? field.name] && (
                            <div className="text-danger">
                              {errors[field.camelName ?? field.name]}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSave}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </CSSTransition>
      <CSSTransition
        in={showModal}
        timeout={300}
        classNames="backdrop"
        unmountOnExit
        nodeRef={backdropRef}
      >
        <div ref={backdropRef} className="modal-backdrop fade show"></div>
      </CSSTransition>
    </>
  );
};

export default EditModal;
