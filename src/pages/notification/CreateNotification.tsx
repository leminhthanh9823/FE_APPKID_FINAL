import { ICreateNotificationRequest } from "@/diagram/request/notification/createNotification.request";
import usePostItemJson from "@/hooks/usePostItemJson";
import { ENDPOINT } from "@/routers/endpoint";
import { ROUTES } from "@/routers/routes";
import { TYPE_NOTIFY_UC_OPTIONS, TYPE_TARGET_OPTIONS } from "@/utils/constants/options";
import { useEffect, useRef, useState } from "react";
import GradeOptions, { GradeOptionsRef } from "./type-notification-component/GradeOptions";
import { toast } from "react-toastify";
import StudentOptions, { StudentOptionsRef } from "./type-notification-component/StudentOptions";
import { MESSAGE } from "@/utils/constants/errorMessage";
import { VIETNAM_TIMEZONE_OFFSET_HOURS } from "@/utils/constants/constants";



const CreateNotification = () => {

  const [reqNotiCreate, setReqNotiCreate] = useState<ICreateNotificationRequest>({
    title: "",
    content: "",
    type_target: TYPE_TARGET_OPTIONS[0].value,
    is_active: true,
    send_date: new Date(),
    grades: null,
    students: null
  });
  const [selectedTypeTarget, setSelectedTypeTarget] = useState<number>(TYPE_TARGET_OPTIONS[0].value);
  const [minDateTime, setMinDateTime] = useState('');
  const { saveChanges } = usePostItemJson(`${ENDPOINT.NOTIFY}/cms/create`);
  const gradeRef = useRef<GradeOptionsRef>(null);
  const studentRef = useRef<StudentOptionsRef>(null);

  const handleInputChange = (name: string, value: any) => {
    setReqNotiCreate((prev) => prev ? { ...prev, [name]: value } : prev);
  };


  const onSelectRow = (row: any) => {
    setReqNotiCreate((prev) => {
      if (prev) {
        const students = prev.students || [];
        const isSelected = students.includes(row.student_id);
        return {
          ...prev,
          students: isSelected ? students.filter((studentId) => studentId !== row.student_id) : [...students, row.student_id],
        };
      }
      return prev;
    });
  };

  const handleClearSelection = () => {
    setReqNotiCreate((prev) => {
      if (prev) {
        return {
          ...prev,
          students: [],
        };
      }
      return prev;
    });
  }

  const validateForm = () => {
    if(!reqNotiCreate.title.trim()){
      toast.error("Title is required.");
      return false;
    }
    if(!reqNotiCreate.content.trim()){
      toast.error("Content is required.");
      return false; 
    }
    return true;
  }
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    let payload;
    if(selectedTypeTarget === 1 && gradeRef.current?.validate()) {
      toast.error("Please select at least one grade.");
    }
    else if(selectedTypeTarget === 2 && studentRef.current?.validate()) {
      toast.error("Please select at least one student.");
    }
    payload = {
      ...reqNotiCreate,
      grades: selectedTypeTarget === 1 ? reqNotiCreate.grades : null,
      students: selectedTypeTarget === 2 ? reqNotiCreate.students : null,
      type_target: selectedTypeTarget,
    }

    let isSuccess = await saveChanges(payload);
    if (isSuccess) {
      toast.success("Notification created successfully.");
      setTimeout(() => {
        window.location.href = ROUTES.NOTIFICATION;
      }, 5000);
    }
  };

  return (
    <>
      <main className="main" id="main">
        <div className="pagetitle">
          <h1>Create notification</h1>
          <nav>
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <a href={`${ROUTES.DASHBOARD}`}>CMS</a>
              </li>
              <li className="breadcrumb-item">
                <a href={`${ROUTES.NOTIFICATION}`}>Notifications</a>
              </li>
              <li className="breadcrumb-item active">
                Create notification
              </li>
            </ol>
          </nav>
        </div>
        <div
          className="row mb-3"
          style={{
            padding: "2%",
            backgroundColor: "#fff",
            boxShadow: "0px 0px 20px #8c98a4",
          }}
        >
          <div key={"title"} className={`col-12 mb-3`}>
            <label className="form-label">{"Title"}<span style={{color: 'red'}}>*</span></label>
            <input
              className="form-control"
              value={reqNotiCreate?.title || ""}
              onChange={(e) =>
                handleInputChange("title", e.target.value)
              }
            />
          </div>

          <div key={"content"} className={`col-12 mb-3`}>
            <label className="form-label">{"Content"}<span style={{color: 'red'}}>*</span></label>
            <textarea
              className="form-control"
              value={reqNotiCreate?.content || ""}
              onChange={(e) =>
                handleInputChange("content", e.target.value)
              }
            />
          </div>

          <div key={"type-target"} className={`col-12 mb-3`}>
            <label className="form-label">{"Receivers ?"}<span style={{color: 'red'}}>*</span></label>
            <select
              className="form-select"
              value={selectedTypeTarget || TYPE_TARGET_OPTIONS[0].value}
              onChange={(e) =>
                setSelectedTypeTarget(parseInt(e.target.value))
              }
            >
              {TYPE_TARGET_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {
            selectedTypeTarget === 1 && (
             <GradeOptions
                grades={reqNotiCreate.grades}
                onChange={(grades) => handleInputChange("grades", grades)}
             />
            )
          }

          {
            selectedTypeTarget === 2 && (
              <StudentOptions
                students={reqNotiCreate.students || []}
                onSelectRow={(row: any) => onSelectRow(row)}
                handleClearSelection={handleClearSelection}
              />
            )
          }

          <div className="d-flex justify-content-end">
            {
              <button
                type="button"
                className="btn btn-primary col-2"
                onClick={handleSubmit}
              >
                Create
              </button>
            }
          </div>

        </div>
      </main>
    </>
  );
};

export default CreateNotification;
