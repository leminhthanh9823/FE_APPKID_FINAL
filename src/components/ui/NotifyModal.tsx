import { CSSTransition } from "react-transition-group";
import '../../styles/modalTransition.css';
import useDeleteItem from "../../hooks/useDeleteItem";
import { toast } from "react-toastify";
import useCreateItem from "@/hooks/useCreateItem";
import { METHOD } from "@/utils/constants/constants";
import { MESSAGE } from "@/utils/constants/errorMessage";
import { useEffect, useState } from "react";
import { ICreateNotificationRequest } from "@/diagram/request/notification/createNotification.request";
import { ENDPOINT } from "@/routers/endpoint";
import usePostItemJson from "@/hooks/usePostItemJson";

interface NotifyModalProps {
  showModal?: boolean;
  onClose: () => void;
  title?: string;
  content?: string;
  student_id: number;
}

const DEFAULT_TARGET_TYPE = 2;
const DEFAULT_ENDPOINT = ENDPOINT.NOTIFY + "/cms/create";
const NotifyModal: React.FC<NotifyModalProps> = ({ showModal, onClose, title, content, student_id }) => {
  const {error, saveChanges} = usePostItemJson(DEFAULT_ENDPOINT);
  const [reqNotify, setReqNotify] = useState<ICreateNotificationRequest>();

  useEffect(() => {
    setReqNotify({
      title: title || "",
      content: content || "",
      type_target: DEFAULT_TARGET_TYPE,
      is_active: true,
      send_date: null,
      grades: null,
      students: [student_id],
    });
  }, []);

  const handleChange = (name: string, value: any) => {
    setReqNotify((prev) => prev ? { ...prev, [name]: value } : prev);
  };

  const handleSend =  async () => {
    if(!reqNotify || !reqNotify.title || !reqNotify.content) {
      toast.error("Please fill in all required fields.");
      return;
    }
    let isSuccess = await saveChanges(reqNotify);
    if (isSuccess) {
      toast.success("Notification created successfully.");
      setTimeout(() => {
        onClose();
      }, 5000);
      return;
    }
  }

  return (
    <>
      <CSSTransition in={showModal} timeout={300} classNames="modal" unmountOnExit>
        <div className="modal d-block" tabIndex={-1} role="dialog">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Notify</h5>
                <button type="button" className="btn-close" onClick={onClose}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-12">
                    <label className="form-label">{"Title"}</label>
                    <span className="text-danger"> *</span>
                    <input
                      type="text"
                      className="form-control"
                      value={reqNotify?.title || ""}
                      onChange={(e) =>
                        handleChange("title", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">{"Content"}</label>
                    <span className="text-danger"> *</span>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={reqNotify?.content || ""}
                      onChange={(e) =>
                        handleChange("content", e.target.value)
                      }
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSend}>Send</button>
              </div>
            </div>
          </div>
        </div>
      </CSSTransition>
      <CSSTransition in={showModal} timeout={300} classNames="backdrop" unmountOnExit>
        <div className="modal-backdrop fade show"></div>
      </CSSTransition>
    </>
  );
};

export default NotifyModal;
