import { IEditDetailFeedbackAdminRequest } from '@/diagram/request/feedback/editDetailFeedbackAdmin.request';
import { IGetDetailAssignFeedbackResponse } from '@/diagram/response/feedback/getDetailAssignFeedback.response';
import useFetchItem from '@/hooks/useFetchItem';
import { ENDPOINT } from '@/routers/endpoint';
import { ROUTES } from '@/routers/routes';
import { FEEDBACK_CATEGORY_OPTIONS, FEEDBACK_CATEGORY_UC_OPTIONS, FEEDBACK_IMPORTANCE_OPTIONS, FEEDBACK_STATUS_OPTIONS, FEEDBACK_STATUS_SOLVE_OPTIONS, STATUS_UC_OPTIONS } from '@/utils/constants/options';
import { buildRoute } from '@/utils/helper/routeHelper';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { VIETNAM_TIMEZONE_OFFSET_HOURS } from "@/utils/constants/constants";
import useFetchTeacher from '@/hooks/useFetchTeacher';
import { ITeacherRecord } from '@/pages/Teacher';
import usePutItemJson from '@/hooks/usePutItemJson';
import { MESSAGE } from '@/utils/constants/errorMessage';

const DetailTeacherFeedback: React.FC = () => {
  const { id: feedbackId } = useParams<{ id: string }>();
  const [response, setResponse] = useState<IGetDetailAssignFeedbackResponse | null>(null);
  const [req, setReq] = useState<IEditDetailFeedbackAdminRequest | null>(null);
  const { data } = useFetchItem(
    `${ENDPOINT.FEEDBACK}/cms/get-feedback-detail`,
    { id: feedbackId }
  );

  const { saveChanges } = usePutItemJson(
    `${ENDPOINT.FEEDBACK}/cms/update-solve-feedback`,
  );

  const { data: typeTeacher } = useFetchItem(
    `${ENDPOINT.FEEDBACK}/cms/get-type-teacher`,
    { feedback_id: feedbackId }
  );

  useEffect(() => {
    if (data) {
      setResponse(data as IGetDetailAssignFeedbackResponse);
      setReq({
        id: data.id,
        comment_solve: data.comment_solve || '',
        comment_confirm: data.comment_confirm || '',
        status_solve: data.status_solve || 0,
        status_confirm: data.status_confirm || 0,
      });
    }
  }, [data]);

  const handleInputChange = (name: string, value: any) => {
    setReq((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleSubmit = async () => {
    if (!req) {
      toast.error("Please fill in all required fields.");
      return;
    }
    console.log(req.status_solve)
    if ( (typeTeacher == 0  && req.status_solve == null) || (typeTeacher == 1 && req.status_confirm == null)) {
      toast.error("Please select required fields!");
      return;
    }
    let isSuccess = false;
    isSuccess = await saveChanges(req);

    if (isSuccess) {
    } else {
      toast.error(MESSAGE.UPDATE_FAIL);
      return;
    }
  }

  return (
    <>
      <main className="main" id="main">
        <div className="pagetitle">
          <h1>Edit feedback</h1>
          <nav>
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <a href={`${ROUTES.DASHBOARD}`}>CMS</a>
              </li>
              <li className="breadcrumb-item">
                <a href={`${ROUTES.FEEDBACK_TEACHER}`}>Feedback</a>
              </li>
              <li className="breadcrumb-item active">Detail & Assign teacher</li>
            </ol>
          </nav>
        </div>
        <div
          className="row mb-3"
          style={{
            padding: '2%',
            backgroundColor: '#fff',
            boxShadow: '0px 0px 20px #8c98a4',
          }}
        >
          <h3>Thông tin feedback</h3>
          <div className={`col-12 mb-3 row`}>
            <div className={`col-4`}>
              <label className="form-label">
                {response?.created_at
                  ? typeof response.created_at === 'string'
                    ? response.created_at
                    : response.created_at.toLocaleString()
                  : ''}
              </label>
            </div>
          </div>

          <div className={`col-12 mb-3 row`}>
            <div className={`col-4`}>
              <label className="form-label">
                Parent name
              </label>
              <input
                className="form-control"
                disabled
                type="text"
                value={response?.parent_name || ''}
              />
            </div>
            <div className={`col-4`}>
              <label className="form-label">
                Parent email
              </label>
              <input
                className="form-control"
                disabled
                type="text"
                value={response?.parent_email || ''}
              />
            </div>

            <div className={`col-4`}>
              <label className="form-label">
                Parent phone
              </label>
              <input
                className="form-control"
                disabled
                type="text"
                value={response?.parent_phone || ''}
              />
            </div>
          </div>

          <div className={`col-12 mb-3 row`}>
            <div className={`col-4`}>
              <label className="form-label">
                Comment for reading
              </label>
              <input
                className="form-control"
                disabled
                type="text"
                value={response?.reading_name || ''}
              />
            </div>
            <div className={`col-2`}>
              <label className="form-label">
                Rating
              </label>
              <input
                className="form-control"
                disabled
                type="text"
                value={response?.rating || ''}
              />
            </div>
            <div className={`col-6`}>
              <label className="form-label">
                Comment from parent
              </label>
              <input
                className="form-control"
                disabled
                type="text"
                value={response?.comment || ''}
              />
            </div>
          </div>

          <h3>Thông tin xử lý</h3>
          <div className={`col-12 mt-3 mb-3 row`}>
            <div className={`col-2`}>
              <label className="form-label">
                Active
              </label>
              <input
                className="form-control"
                disabled
                type="text"
                value={response && response.is_active ? 'Active' : 'Inactive'}
              />
            </div>

            <div className={`col-2`}>
              <label className="form-label">
                Important level
              </label>
              <input
                className="form-control"
                disabled
                type="text"
                value={response && response.is_important
                  ? FEEDBACK_IMPORTANCE_OPTIONS.find(option => option.value === response.is_important)?.label
                  : FEEDBACK_IMPORTANCE_OPTIONS[0].label}
              />
            </div>

            <div className={`col-4`}>
              <label className="form-label">
                Category feedback
              </label>
              <input
                className="form-control"
                disabled
                type="text"
                value={response && response.feedback_category_id
                  ? FEEDBACK_CATEGORY_UC_OPTIONS.find(option => option.value === response.feedback_category_id)?.label
                  : FEEDBACK_CATEGORY_UC_OPTIONS[0].label}
              />
            </div>

            <div className={`col-4`}>
              <label className="form-label">
                Status feedback
              </label>
              <input
                className="form-control"
                disabled
                type="text"
                value={response && response.status_feedback
                  ? FEEDBACK_STATUS_OPTIONS.find(option => option.value === response.status_feedback)?.label
                  : FEEDBACK_STATUS_OPTIONS[0].label}
              />
            </div>
          </div>
          { // Solver information
          }
          <h4>Assigned Teacher</h4>
          <div className={`col-12 mb-3 row`}>
            <div className={`col-4`}>
              <label className="form-label">
                Deadline
              </label>
              <input
                type="datetime-local"
                className="form-control"
                disabled
                value={
                  response?.deadline
                    ? new Date(response.deadline).toISOString().slice(0, 16)
                    : ""
                }
              />
            </div>
          </div>
          <div className={`col-12 mb-3 row`}>
            <div className={`col-12 mb-3 row`}>
              <label className="form-label">
                Solver
              </label>
              <input
                className="form-control"
                disabled
                type="text"
                value={response && response.solver_name ? response.solver_name : ''}
              />
            </div>
            <div className={`col-12 mb-3 row`}>
              <div className={`col-4`}>
                <label className="form-label">
                  Solve status
                  {
                    typeTeacher === 0 && (
                      <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
                    )
                  }
                </label>
                <div>
                  <Select
                    id="status-filter"
                    isDisabled={typeTeacher !== 0}
                    options={FEEDBACK_STATUS_SOLVE_OPTIONS}
                    onChange={(option) => handleInputChange('status_solve', option?.value)}
                    value={FEEDBACK_STATUS_SOLVE_OPTIONS.find(
                      (option) => option.value === (typeTeacher === 0 ? req?.status_solve : response?.status_solve)
                    )}
                  />
                </div>
              </div>

              <div className={`col-8`}>
                <label className="form-label">
                  Comment by solver
                </label>
                <input
                  className="form-control"
                  disabled={typeTeacher !== 0}
                  type="text"
                  onChange={(e) => handleInputChange('comment_solve', e.target.value)}
                  value={typeTeacher === 0 ? req?.comment_solve : response?.comment_solve || ''}
                />
              </div>
            </div>


          </div>

          { // Confirmer information
          }
          <h4>Confirming Teacher</h4>
          <div className={`col-12 mb-3 row`}>
            <label className="form-label">
              Confirmer
            </label>
            <input
              className="form-control"
              disabled
              type="text"
              value={response && response.confirmer_name ? response.confirmer_name : ''}
            />
          </div>

          <div className={`col-12 mb-3 row`}>
            <div className={`col-4`}>
              <label className="form-label">
                Confirm status
                {
                  typeTeacher === 1 && (
                    <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
                  )
                }
              </label>
              <div>
                <Select
                  id="status-filter"
                  isDisabled={typeTeacher !== 1}
                  options={FEEDBACK_STATUS_SOLVE_OPTIONS}
                  onChange={(option) => handleInputChange('status_confirm', option?.value)}
                  value={FEEDBACK_STATUS_SOLVE_OPTIONS.find(
                    (option) => option.value === (typeTeacher === 1 ? req?.status_confirm : response?.status_confirm)
                  )}
                />
              </div>
            </div>
            <div className={`col-8`}>
              <label className="form-label">
                Comment by confirmer
              </label>
              <input
                className="form-control"
                disabled={typeTeacher !== 1}
                type="text"
                onChange={(e) => handleInputChange('comment_confirm', e.target.value)}
                value={typeTeacher === 1 ? req?.comment_confirm : response?.comment_confirm || ''}
              />
            </div>
          </div>

          <div className="d-flex justify-content-end gap-4 mt-4">
            <button
              type="button"
              className="btn btn-primary col-2"
              onClick={handleSubmit}
            >
              Save
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

export default DetailTeacherFeedback;