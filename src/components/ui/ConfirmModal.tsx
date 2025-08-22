import { useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import '../../styles/modalTransition.css';
import useDeleteItem from '../../hooks/useDeleteItem';
import { toast } from 'react-toastify';
import useCreateItem from '@/hooks/useCreateItem';
import { METHOD } from '@/utils/constants/constants';
import { MESSAGE } from '@/utils/constants/errorMessage';

interface ConfirmModalProps {
  showModal: boolean;
  onClose: () => void;
  message: string;
  selectedItemId: string;
  endpoint: string;
  customUrl?: string;
  customMethod?: string;
  data?: any;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  showModal,
  message,
  onClose,
  selectedItemId,
  endpoint,
  customUrl,
  customMethod,
  data,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  let url = customUrl ? customUrl : `${endpoint}/delete/${selectedItemId}`;
  const { error, saveChanges } =
    customMethod === METHOD.POST
      ? useCreateItem(url, data)
      : useDeleteItem(url);
  const handleDelete = async () => {
    const isSuccess = await saveChanges();
    if (isSuccess) {
      toast.success(MESSAGE.DELETE_SUCCESS);
      onClose();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      // Lỗi đã được xử lý trong hook useDeleteItem hoặc useCreateItem
      onClose();
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
          className="modal d-block"
          tabIndex={-1}
          role="dialog"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmation</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={onClose}
                ></button>
              </div>
              <div className="modal-body">{message}</div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleDelete}>
                  Confirm
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

export default ConfirmModal;
