import React, { forwardRef, useImperativeHandle } from "react";
import Select from "react-select"; // npm install react-select
import { GRADE_UC_OPTIONS } from "@/utils/constants/options";

interface GradeOptionsProps {
  grades: number[] | null;
  onChange: (grades: number[] | null) => void;
}

export interface GradeOptionsRef {
  validate: () => boolean;
}

const GradeOptions = forwardRef<any, GradeOptionsProps>(({ grades, onChange }, ref) => {
  useImperativeHandle(ref, () => ({
    validate: () => {
      return Array.isArray(grades) && grades.length > 0;
    }
  }));

  return (
    <div className="card">
      <h5 className="card-title">Select Target Grades</h5>
      <div className="card-body">
        <Select
          options={GRADE_UC_OPTIONS}
          isMulti
          value={GRADE_UC_OPTIONS.filter(opt => grades?.includes(opt.value as number))}
          onChange={(selectedOptions) =>
            onChange(selectedOptions.map((opt) => opt.value as number))
          }
          className="basic-multi-select"
          classNamePrefix="select"
          placeholder="Select grades..."
        />
      </div>
    </div>
  );
});

export default GradeOptions;
