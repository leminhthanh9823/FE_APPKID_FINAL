import React, { useState, useRef, useImperativeHandle } from "react";
import { GRADE_OPTIONS } from "@/utils/constants/options";
import { Constants } from "@/utils/constants/constants";
import { ENDPOINT } from "@/routers/endpoint";
import useFetchStudentManagement from "@/hooks/useFetchStudentManagement";
import { StudentManageColumns } from "@/utils/constants/columns/student/studentManageColumn";
import Table from "@/components/Table";
import Pagination from "@/components/Pagination";
import { buildRoute } from "@/utils/helper/routeHelper";
import { ROUTES } from "@/routers/routes";
import { StudentSelectColumns } from "@/utils/constants/columns/student/studentSelectColumn";
import Select from 'react-select';

export interface StudentOptionsProps {
  students?: number[];
  onSelectRow?: (id: number) => void;
  handleClearSelection?: () => void;
}

export interface StudentOptionsRef {
  validate: () => boolean;
}

const StudentOptions = React.forwardRef<StudentOptionsRef, StudentOptionsProps>(({
  students,
  onSelectRow,
  handleClearSelection
}, ref) => {

  useImperativeHandle(ref, () => ({
    validate: () => {
      return Array.isArray(students) && students.length > 0;
    }
  }));

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(
    Number(localStorage.getItem(Constants.LOCAL_STORAGE_KEY + "-" + ENDPOINT.STUDENT)) || 10
  );
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);

  const { data, totalRecords, totalPages, setParams } = useFetchStudentManagement(
    `${ENDPOINT.STUDENT}/students-parents`,
    {
      pageNumb: currentPage,
      pageSize: pageSize,
      searchTerm: searchTerm || null,
      grade_id: selectedGrade || null,
    }
  );

  const handlePageResize = (newSize: number) => {
    localStorage.setItem(Constants.LOCAL_STORAGE_KEY + "-" + ENDPOINT.READING, newSize.toString());
    setPageSize(newSize);
    setCurrentPage(1);
    handleParamsChange(1, searchTerm, newSize, selectedGrade);
  };

  const handleGradeChange = (selectedOption: { value: number | null; label: string } | null) => {
    const newGrade = selectedOption ? selectedOption.value : null;
    setSelectedGrade(newGrade);
    setCurrentPage(1);
    handleParamsChange(1, searchTerm, pageSize, newGrade);
  };

  const handleParamsChange = (
    page: number,
    search: string,
    size: number,
    grade: number | null
  ) => {
    setParams({
      pageNumb: page,
      pageSize: size,
      searchTerm: search || null,
      grade_id: grade || null,
    });
  };

  return (
    <div className="card" >
      <h5 className="card-title">Select students</h5>
      <div className="card-body">
        <div style={{ width: '200px' }}>
          <Select
            id="grade-filter"
            options={GRADE_OPTIONS}
            onChange={handleGradeChange}
            value={GRADE_OPTIONS.find(option => option.value === selectedGrade)}
            placeholder="Select Grade"
          />
        </div>
        <Table
          columns={StudentSelectColumns}
          data={data}
          onSearch={(term) => {
            setSearchTerm(term);
            setCurrentPage(1);
            handleParamsChange(1, term, pageSize, selectedGrade);
          }}
          endpoint={ENDPOINT.STUDENT}
          isCreatable={false}
          isImportable={false}
          isDeletable={false}
          isEditable={false}
          customActions={[
            {
              action: "View learning history",
              link: (row) => buildRoute(ROUTES.DETAIL_STUDENT, { id: row.student_id }),
            }
          ]}
          trueLabel="Active"
          falseLabel="Lock"
          onSelectRow={(row: any) => onSelectRow && onSelectRow(row)}
          selectedIds={students}
          keyId={"student_id"}
          handleClearSelection={() => handleClearSelection && handleClearSelection()}
        />
        <Pagination
          pageSize={pageSize}
          numOfRecords={totalRecords}
          currentPage={currentPage}
          onPageChange={(page: number) => {
            setCurrentPage(page);
            handleParamsChange(page, searchTerm, pageSize, selectedGrade);
          }}
          onPageSizeChange={handlePageResize}
          totalPage={totalPages}
        />
      </div>

    </div>
  );
});

export default StudentOptions;
