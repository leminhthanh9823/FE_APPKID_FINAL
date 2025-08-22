import { useEffect, useState, useRef } from 'react';
import '../../styles/modalTransition.css';
import { CSSTransition } from 'react-transition-group';
import Field from '../../types/field';
import useCreateItem from '../../hooks/useCreateItem';
import { toast } from 'react-toastify';
import { ENDPOINT } from '@/routers/endpoint';
import { formatMessage, MESSAGE } from '@/utils/constants/errorMessage';
import Select from "react-select";
interface CreateModalProps {
  title: string;
  showModal: boolean;
  onClose: () => void;
  fields: Field[];
  endpoint: string;
  customLink?: string;
  id?: string;
}

const CreateModal: React.FC<CreateModalProps> = ({
  title,
  showModal,
  onClose,
  fields,
  endpoint,
  customLink,
  id,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({}); // Lưu lỗi cho từng field
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  let url = customLink ? `${endpoint}${customLink}` : `${endpoint}/create`;
  if (endpoint === ENDPOINT.TRANSFER_PLAN) {
    url = `${endpoint}/add-transfer-plan`;
  }
  const { error, saveChanges } = useCreateItem(url, formData);
  const handleSave = async () => {
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

    const isSuccess = await saveChanges();
    if (isSuccess) {
      toast.success(MESSAGE.ADD_SUCCESS);
      handleClose();
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };

  // Khởi tạo formData với giá trị mặc định từ fields
  useEffect(() => {
    const initialData: Record<string, any> = {};
    fields.forEach((field) => {
      initialData[field.camelName ?? field.name] = field.value || '';
    });
    setFormData(initialData);
  }, [fields]);

  useEffect(() => {
    if (id) {
      setFormData((prev) => ({ ...prev, id }));
    }
  }, [id]);

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

  const handleClose = () => {
    setFormData({});
    setErrors({});
    onClose();
  };

  const groupedFields = fields.reduce<Record<string, Field[]>>((acc, field) => {
    const group = field.rowGroup ?? field.name;
    if (!acc[group]) acc[group] = [];
    acc[group].push(field);
    return acc;
  }, {});

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
                  onClick={handleClose}
                ></button>
              </div>
              <div className="modal-body">
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
                                formData[field.camelName ?? field.name] ?? ''
                              }
                              onChange={(e) =>
                                handleChange(
                                  field.camelName ?? field.name,
                                  e.target.value
                                )
                              }
                            />
                          ) : field.type === 'textarea' ? (
                            <textarea
                              className="form-control"
                              value={
                                formData[field.camelName ?? field.name] ?? ''
                              }
                              onChange={(e) =>
                                handleChange(
                                  field.camelName ?? field.name,
                                  e.target.value
                                )
                              }
                            />
                          ) : field.type === 'password' ? (
                            <input
                              type="password"
                              className="form-control"
                              value={
                                formData[field.camelName ?? field.name] ?? ''
                              }
                              onChange={(e) =>
                                handleChange(
                                  field.camelName ?? field.name,
                                  e.target.value
                                )
                              }
                            />
                          ) : field.type === 'date' ? (
                            <input
                              type="date"
                              className="form-control"
                              value={
                                formData[field.camelName ?? field.name] ?? ''
                              }
                              onChange={(e) =>
                                handleChange(
                                  field.camelName ?? field.name,
                                  e.target.value
                                )
                              }
                            />
                          ) : field.type === 'checkbox' ? (
                            <div className="form-check">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={
                                  formData[field.camelName ?? field.name] ??
                                  false
                                }
                                onChange={(e) =>
                                  handleChange(
                                    field.camelName ?? field.name,
                                    e.target.checked
                                  )
                                }
                              />
                            </div>
                          ) : field.type === 'select' && field.options ? (
                            <select
                              className="form-select"
                              value={
                                formData[field.camelName ?? field.name] !==
                                  null &&
                                formData[field.camelName ?? field.name] !==
                                  undefined
                                  ? String(
                                      formData[field.camelName ?? field.name]
                                    )
                                  : ''
                              }
                              onChange={(e) => {
                                const value = e.target.value;
                                let parsedValue: any = value;

                                // Nếu chọn "Select an option", set về empty string
                                if (value === '') {
                                  parsedValue = '';
                                } else {
                                  // Parse value based on option type
                                  if (
                                    field.options &&
                                    field.options.length > 0
                                  ) {
                                    const firstOptionValue =
                                      field.options[0].value;

                                    if (typeof firstOptionValue === 'number') {
                                      parsedValue = Number(value);
                                    } else if (
                                      typeof firstOptionValue === 'boolean'
                                    ) {
                                      parsedValue = value === 'true';
                                    }
                                    // For string, keep as is
                                  }
                                }

                                handleChange(
                                  field.camelName ?? field.name,
                                  parsedValue
                                );
                              }}
                            >
                              <option value="">Select an option</option>
                              {field.options.map((option) => (
                                <option value={option.value} key={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          ) : field.type === 'multi-select' && field.options ? (
                            <Select
                              options={field.options}
                              isMulti
                              value={field.options.filter(
                                (opt) =>
                                  formData[field.camelName ?? field.name]?.includes(
                                    opt.value
                                  )
                              )}
                              onChange={(selectedOptions) =>
                                handleChange(
                                  field.camelName ?? field.name,
                                  selectedOptions.map((opt) => opt.value)
                                )
                              }
                              className="basic-multi-select"
                              classNamePrefix="select"
                              placeholder="Select options..."
                            />
                          ) : field.type === 'file' ? (
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
                          ) : null}

                          {/* Hiển thị lỗi dưới mỗi field */}
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
                  onClick={handleClose}
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

export default CreateModal;
