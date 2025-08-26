import { IGetEditNotificationResponse } from "@/diagram/response/notification/getEditNotification.response";
import useFetchDetailNotification from "@/hooks/notification/useFetchDetailNotification";
import useFetchItem from "@/hooks/useFetchItem";
import { ENDPOINT } from "@/routers/endpoint";
import { ROUTES } from "@/routers/routes";
import { VIETNAM_TIMEZONE_OFFSET_HOURS } from "@/utils/constants/constants";
import { STATUS_UC_OPTIONS, TYPE_NOTIFY_UC_OPTIONS, TYPE_TARGET_OPTIONS } from "@/utils/constants/options";
import { buildRoute } from "@/utils/helper/routeHelper";
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import GradeOptions, { GradeOptionsRef } from "./type-notification-component/GradeOptions";
import StudentOptions, { StudentOptionsRef } from "./type-notification-component/StudentOptions";
import usePutItemJson from "@/hooks/usePutItemJson";

const EditNotification: React.FC = () => {
  const { id: notification_id } = useParams<{ id: string }>();
  const { data, setData, minDateTime, setMinDateTime } = useFetchDetailNotification(`${ENDPOINT.NOTIFY}/cms/get-by-id`, { id: notification_id });
  const { saveChanges } = usePutItemJson(`${ENDPOINT.NOTIFY}/cms/update-by-id`);
  const gradeRef = useRef<GradeOptionsRef>(null);
  const studentRef = useRef<StudentOptionsRef>(null);

  const handleInputChange = (name: string, value: any) => {
    setData((prev) => prev ? { ...prev, [name]: value } : prev);
  };

  const onSelectRow = (row: any) => {
    setData((prev) => {
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
    setData((prev) => {
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
    if(!data?.title?.trim()){
      toast.error("Title is required.");
      return false;
    }
    if(!data?.content?.trim()){
      toast.error("Content is required.");
      return false; 
    }
    return true;
  }

  const handleSubmit = async () => {
    if (!data) {
      toast.error("No data to save.");
      return;
    }
    if(!validateForm()) {
      return;
    }
    let payload;
    if(data.type_target === 1 && gradeRef.current?.validate()) {
      toast.error("Please select at least one grade.");
    }
    else if(data.type_target === 2 && studentRef.current?.validate()) {
      toast.error("Please select at least one student.");
    }
    payload = {
      ...data,
      grades: data.type_target === 1 ? data.grades : null,
      students: data.type_target === 2 ? data.students : null,
    }

    let isSuccess = await saveChanges(payload);
    if (isSuccess) {
      setTimeout(() => {
        window.location.href = ROUTES.NOTIFICATION;
      }, 5000);
    }
  }
  
  return (
    <>
      <main className="main" id="main">
        <div className="pagetitle">
          <h1>View and edit notification</h1>
          <nav>
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <a href={`${ROUTES.DASHBOARD}`}>CMS</a>
              </li>
              <li className="breadcrumb-item">
                <a href={`${ROUTES.NOTIFICATION}`}>Notifications</a>
              </li>
              <li className="breadcrumb-item active">Detail notification</li>
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
              value={data?.title || ""}
              onChange={(e) =>
                handleInputChange("title", e.target.value)
              }
            />
          </div>

          <div key={"content"} className={`col-12 mb-3`}>
            <label className="form-label">{"Content"}<span style={{color: 'red'}}>*</span></label>
            <textarea
              className="form-control"
              value={data?.content || ""}
              onChange={(e) =>
                handleInputChange("content", e.target.value)
              }
            />
          </div>

          <div key={"type-target"} className={`col-12 mb-3`}>
            <label className="form-label">{"Receivers ?"}<span style={{color: 'red'}}>*</span></label>
            <select
              className="form-select"
              value={data?.type_target || TYPE_TARGET_OPTIONS[0].value}
              disabled
            >
              {TYPE_TARGET_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div key={"status"} className={`col-12 mb-3`}>
            <label className="form-label">{"Status"}<span style={{color: 'red'}}>*</span></label>
            <select
              className="form-select"
              value={Number(data?.is_active) || 0}
              onChange={(e) =>
                handleInputChange("is_active", e.target.value)
              }
            >
              {STATUS_UC_OPTIONS.map((option) => (
                <option value={Number(option.value) || 0} key={option.label}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

           {
            data?.type_target === 1 && (
             <GradeOptions
                grades={data.grades}
                onChange={(grades) => handleInputChange("grades", grades)}
             />
            )
          }

          {
            data?.type_target === 2 && (
              <StudentOptions
                students={data.students || []}
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
                Save
              </button>
            }
          </div>
        </div>
      </main>
    </>
  )
}

export default EditNotification;