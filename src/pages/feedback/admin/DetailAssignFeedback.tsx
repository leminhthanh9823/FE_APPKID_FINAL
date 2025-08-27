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

const DetailAssignFeedback: React.FC = () => {
  const { id: feedbackId } = useParams<{ id: string}>();
  const [response, setResponse] = useState<IGetDetailAssignFeedbackResponse | null>(null);
  const [req, setReq] = useState<IEditDetailFeedbackAdminRequest | null>(null);
  const [minDateTime, setMinDateTime] = useState('');
  const [teacherOptions, setTeacherOptions] = useState<{ value: number; label: string }[]>([]);
  const { data } = useFetchItem(
    `${ENDPOINT.FEEDBACK}/cms/get-feedback-detail`,
    { id: feedbackId }
  );

  const { data: teachers } = useFetchTeacher<ITeacherRecord>(`${ENDPOINT.USER}/teachers`, {
      pageNumb: 1,
      pageSize: 1000,
  });

  const { saveChanges } = usePutItemJson(
    `${ENDPOINT.FEEDBACK}/cms/update-assign-feedback`,
  );

  useEffect(() => {
    const now = new Date();
    const utcNow = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    const vietnamNow = new Date(utcNow + (VIETNAM_TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000));
    
    setMinDateTime(vietnamNow.toISOString().slice(0, 16));
  }, []);

  useEffect(() => {
    if (data) {
      setResponse(data as IGetDetailAssignFeedbackResponse);
      setReq({
        id: data.id,
        is_important: data.is_important,
        feedback_category_id: data.feedback_category_id,
        solver_id: data.solver_id,
        confirmer_id: data.confirmer_id,
        deadline: data.deadline,
        status_feedback: data.status_feedback,
        is_active: data.is_active,
      });
    } 

    if(teachers && teachers.length > 0) {
      const options = teachers.map((teacher) => ({
        value: teacher.id,
        label:  teacher.name + ' - ' + teacher.email + ' - ' + teacher.phone,
      }));
      setTeacherOptions(options);
    }
  }, [data, teachers]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDateTimeString = e.target.value;
    
    if (!selectedDateTimeString) {
      handleInputChange("deadline", null);
      return;
    }

    const selectedDateLocal = new Date(selectedDateTimeString);

    if (isNaN(selectedDateLocal.getTime())) {
      toast.error("Invalid date selected.");
      handleInputChange("deadline", null);
      return;
    }

    const now = new Date();
    const utcNowMs = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    const vietnamNowMs = utcNowMs + (VIETNAM_TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000);

    const selectedTimestampLocal = selectedDateLocal.getTime();
    const selectedTimestampUTC = selectedTimestampLocal + (selectedDateLocal.getTimezoneOffset() * 60 * 1000);
    const selectedTimestampVietnam = selectedTimestampUTC + (VIETNAM_TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000);

    if (selectedTimestampVietnam <= vietnamNowMs) {
      toast.error("Send date and time cannot be in the past (Vietnam time).");
      return;
    }

    handleInputChange("deadline", selectedDateLocal);
  };

  const handleInputChange = (name: string, value: any) => {
    setReq((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleSubmit = async () => {
    if (!req) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!req.solver_id || !req.confirmer_id || !req.deadline) {
      toast.error("Please select required fields!");
      return;
    }
    await saveChanges(req);
  }

  return (
    <>
      <main className="main" id="main">
        <div className="pagetitle">
          <h1>Edit feedback </h1>
          <nav>
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <a href={`${ROUTES.DASHBOARD}`}>CMS</a>
              </li>
              <li className="breadcrumb-item">
                <a href={`${ROUTES.FEEDBACK_ADMIN}`}>Feedback</a>
              </li>
              <li className="breadcrumb-item active">Detail & Assign admin</li>
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
          <h3>Information feedback</h3>
          <div className={`col-12 mb-3 row`}>
            <div className={`col-4`}>
              <label className="form-label">
                Created at: {response?.created_at
                  ? new Date(response.created_at).toLocaleString('vi-VN', {
                      timeZone: 'Asia/Ho_Chi_Minh',
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    })
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

          <h3>Information processing</h3>

          <div className={`col-12 mb-3 row`}>
            <div className={`col-4`}>
              <label className="form-label">
                Deadline 
                <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
              </label>
              <input
                type="datetime-local"
                className="form-control"
                value={
                  req?.deadline
                    ? new Date(req.deadline).toISOString().slice(0, 16)
                    : ""
                }
                min={minDateTime}
                onChange={handleDateChange}
              />
            </div>
          </div>

          <div className={`col-12 mb-3 row`}>
            <div className={`col-2`}>
              <label className="form-label">
                Active
                <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
              </label>
              <div >
                <Select
                  id="status-filter"
                  options={STATUS_UC_OPTIONS}
                  onChange={(option) => handleInputChange('is_active', option?.value)}
                  value={STATUS_UC_OPTIONS.find(
                    (option) => option.value === req?.is_active
                  )}
                  placeholder="Select status"
                />
              </div>
            </div>

            <div className={`col-2`}>
              <label className="form-label">
                Important level
                <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
              </label>
              <div >
                <Select
                  id="status-filter"
                  options={FEEDBACK_IMPORTANCE_OPTIONS}
                  onChange={(option) => handleInputChange('is_important', option?.value)}
                  value={FEEDBACK_IMPORTANCE_OPTIONS.find(
                    (option) => option.value === req?.is_important
                  )}
                  placeholder="Select importance level"
                />
              </div>
            </div>

            <div className={`col-4`}>
              <label className="form-label">
                Category feedback
                <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
              </label>
              <div>
                <Select
                  id="status-filter"
                  options={FEEDBACK_CATEGORY_UC_OPTIONS}
                  onChange={(option) => handleInputChange('feedback_category_id', option?.value)}
                  value={FEEDBACK_CATEGORY_UC_OPTIONS.find(
                    (option) => option.value === req?.feedback_category_id
                  )}
                  placeholder="Select category feedback"
                />
              </div>
            </div>

            <div className={`col-4`}>
              <label className="form-label">
                Status feedback
                <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
              </label>
              <div>
                <Select
                  id="status-filter"
                  options={FEEDBACK_STATUS_OPTIONS}
                  onChange={(option) => handleInputChange('status_feedback', option?.value)}
                  value={
                    FEEDBACK_STATUS_OPTIONS.find(
                      (option) => option.value === req?.status_feedback
                    )
                  }
                  placeholder="Select status feedback"
                />
              </div>
            </div>
          </div>
{ // Solver information
}
          <h4>Assigned Teacher</h4>
          <div className={`col-12 mb-3 row`}>
            <label className="form-label">
              Solver 
              <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
            </label>
            <div>
              <Select
                options={teacherOptions}
                onChange={(option) => handleInputChange('solver_id', option?.value)}
                value={teacherOptions.find(
                  (option) => option.value === req?.solver_id
                )}
                placeholder="Select teacher to solve an issue"
              />
            </div>
          </div>
          <div className={`col-12 mb-3 row`}>
            <div className={`col-4`}>
              <label className="form-label">
                Solve status
              </label>
              <div>
                <Select
                  id="status-filter"
                  isDisabled={true}
                  onChange={(option) => handleInputChange('solver_id', option?.value)}
                  value={FEEDBACK_STATUS_SOLVE_OPTIONS}
                  placeholder="Select teacher to solve an issue"
                />
              </div>
            </div>

            <div className={`col-8`}>
              <label className="form-label">
                Comment by solver
              </label>
              <input
                className="form-control"
                disabled
                type="text"
                value={response?.comment_solve || ''}
              />
            </div>
          </div>

          

{ // Confirmer information
}
          <h4>Confirming Teacher</h4>
          <div className={`col-12 mb-3 row`}>
            <label className="form-label">
              Confirmer 
              <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
            </label>
            <div>
              <Select
                options={teacherOptions}
                onChange={(option) => handleInputChange('confirmer_id', option?.value)}
                value={teacherOptions.find(
                  (option) => option.value === req?.confirmer_id
                )}
                placeholder="Select teacher to confirm the result"
              />
            </div>
          </div>

          <div className={`col-12 mb-3 row`}>
            <div className={`col-4`}>
              <label className="form-label">
                Confirm status
              </label>
              <div>
                <Select
                  id="status-filter"
                  isDisabled={true}
                  value={FEEDBACK_STATUS_SOLVE_OPTIONS.find(
                    (option) => option.value === response?.status_confirm
                  )}
                  placeholder="Select teacher to solve an issue"
                />
              </div>
            </div>
            <div className={`col-8`}>
              <label className="form-label">
                Comment by confirmer
              </label>
              <input
                className="form-control"
                disabled
                type="text"
                value={response?.comment_solve || ''}
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

export default DetailAssignFeedback;