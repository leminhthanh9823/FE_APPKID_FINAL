import { useState } from 'react';
import Table from '../components/Table';
import Pagination from '../components/Pagination';
import { toast } from 'react-toastify';
import { ENDPOINT } from '../routers/endpoint';
import useFetchStudentReport from '../hooks/useFetchStudentReport';
import { Constants } from '@/utils/constants/constants';
import { StudentReportColumns } from '@/utils/constants/columns/studentReportColumns';

const StudentReport: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [pageSize, setPageSize] = useState<number>(
    Number(
      localStorage.getItem(
        Constants.LOCAL_STORAGE_KEY + '-' + ENDPOINT.STUDENT_REPORT
      )
    ) || 10
  );
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);

  const gradeUCOptions = [
    { value: 1, label: 'Grade 1' },
    { value: 2, label: 'Grade 2' },
    { value: 3, label: 'Grade 3' },
    { value: 4, label: 'Grade 4' },
    { value: 5, label: 'Grade 5' },
  ];

  const {
    data: studentReports,
    totalRecords,
    totalPages,
    setParams,
    error,
  } = useFetchStudentReport(`${ENDPOINT.STUDENT_REPORT}`, {
    pageNumb: currentPage,
    pageSize,
    searchTerm: searchTerm || null,
    grade_id: selectedGrade,
  });

  const handleParamsChange = (
    page: number,
    search: string,
    pagesize?: number,
    gradeId?: number | null
  ) => {
    setParams({
      pageNumb: page,
      pageSize: pagesize,
      searchTerm: search || null,
      grade_id: gradeId,
    });

    if (error) toast.error(error);
  };

  const handlePageResize = (newSize: number) => {
    localStorage.setItem(
      Constants.LOCAL_STORAGE_KEY + '-' + ENDPOINT.STUDENT_REPORT,
      newSize.toString()
    );
    setPageSize(newSize);
    setCurrentPage(1);
    handleParamsChange(1, searchTerm, newSize, selectedGrade);
  };

  const handleGradeFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const grade = e.target.value ? Number(e.target.value) : null;
    setSelectedGrade(grade);
    setCurrentPage(1);
    handleParamsChange(1, searchTerm, pageSize, grade);
  };

  return (
    <main className="main" id="main">
      <div className="pagetitle">
        <h1>Student Report</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="/dashboard">CMS</a>
            </li>
            <li className="breadcrumb-item">Reports</li>
            <li className="breadcrumb-item active">Student Report</li>
          </ol>
        </nav>
      </div>

      <div
        style={{
          padding: '2%',
          backgroundColor: '#fff',
          boxShadow: '0 0 20px #8c98a4',
        }}
      >
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <label style={{ fontWeight: 500 }}>Filter by Grade:</label>
          <select
            value={selectedGrade ?? ''}
            onChange={handleGradeFilter}
            style={{ padding: '5px 10px', borderRadius: 4 }}
          >
            <option value="">All Grades</option>
            {gradeUCOptions.map((grade) => (
              <option key={grade.value} value={grade.value}>
                {grade.label}
              </option>
            ))}
          </select>
        </div>

        <Table
          tableName="Student Report"
          columns={StudentReportColumns}
          data={studentReports}
          editFields={[]}
          isEditable={false}
          isDeletable={false}
          endpoint={ENDPOINT.STUDENT_REPORT}
          isCreatable={false}
          isImportable={false}
          onSearch={(searchTerm: string) => {
            setSearchTerm(searchTerm);
            setCurrentPage(1);
            handleParamsChange(1, searchTerm, pageSize, selectedGrade);
          }}
        />
        <Pagination
          pageSize={pageSize}
          numOfRecords={totalRecords}
          currentPage={currentPage}
          onPageChange={(page) => {
            setCurrentPage(page);
            handleParamsChange(page, searchTerm, pageSize, selectedGrade);
          }}
          onPageSizeChange={handlePageResize}
          totalPage={totalPages}
        />
      </div>
    </main>
  );
};

export default StudentReport;
