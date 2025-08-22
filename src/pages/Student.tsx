import { useState, useCallback, useEffect } from 'react';
import Table from '../components/Table';
import { toast } from 'react-toastify';
import Pagination from '../components/Pagination';
import { ENDPOINT } from '../routers/endpoint';
import { Constants } from '@/utils/constants/constants';
import Select from 'react-select';
import { GRADE_OPTIONS } from '@/utils/constants/options';
import { ROUTES } from '@/routers/routes';
import { buildRoute } from '@/utils/helper/routeHelper';
import { StudentManageColumns } from '@/utils/constants/columns/student/studentManageColumn';
import useFetchStudentManagement from '@/hooks/useFetchStudentManagement';
import useToggleStatus from '@/hooks/useToggleStatus';
import RoleGuard from '@/components/RoleGuard';
import { UserRole } from '@/routers/PrivateRoute';
import { useAuth } from '@/hooks/useAuth';

const Student: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [pageSize, setPageSize] = useState<number>(
    Number(
      localStorage.getItem(Constants.LOCAL_STORAGE_KEY + '-' + ENDPOINT.STUDENT)
    ) || 10
  );
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);

  const { isAdmin, isTeacher } = useAuth();

  const { data, error, totalRecords, totalPages, setParams } =
    useFetchStudentManagement(`${ENDPOINT.STUDENT}/students-parents`, {
      pageNumb: currentPage,
      pageSize: pageSize,
      searchTerm: searchTerm || null,
      grade_id: selectedGrade || null,
    });

  useEffect(() => {
    if (data && data.length >= 0) {
      setIsTableLoading(false);
    }
    if (error) {
      toast.error(error);
    }
  }, [data, error]);

  const { toggleStatus } = useToggleStatus({
    endpoint: ENDPOINT.STUDENT,
    onSuccess: () => {
      handleParamsChange(currentPage, searchTerm, pageSize, selectedGrade);
    },
  });

  const handlePageResize = useCallback(
    (newSize: number) => {
      localStorage.setItem(
        Constants.LOCAL_STORAGE_KEY + '-' + ENDPOINT.READING,
        newSize.toString()
      );
      setPageSize(newSize);
      setCurrentPage(1);
      handleParamsChange(1, searchTerm, newSize, selectedGrade);
    },
    [searchTerm, selectedGrade]
  );

  const handleGradeChange = useCallback(
    (selectedOption: { value: number | null; label: string } | null) => {
      const newGrade = selectedOption ? selectedOption.value : null;
      setSelectedGrade(newGrade);
      setCurrentPage(1);
      setIsTableLoading(true);
      handleParamsChange(1, searchTerm, pageSize, newGrade);
    },
    [searchTerm, pageSize]
  );

  const handleParamsChange = useCallback(
    (page: number, search: string, size: number, grade: number | null) => {
      setIsTableLoading(true);
      setParams({
        pageNumb: page,
        pageSize: size,
        searchTerm: search || null,
        grade_id: grade || null,
      });
    },
    [setParams]
  );

  const handleSearch = useCallback(
    (term: string) => {
      setSearchTerm(term);
      setCurrentPage(1);
      handleParamsChange(1, term, pageSize, selectedGrade);
    },
    [pageSize, selectedGrade, handleParamsChange]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      handleParamsChange(page, searchTerm, pageSize, selectedGrade);
    },
    [searchTerm, pageSize, selectedGrade, handleParamsChange]
  );

  return (
    <>
      <main className="main" id="main">
        <div className="pagetitle">
          <h1>Students and reports</h1>
          <nav>
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <a href={`${ROUTES.DASHBOARD}`}>CMS</a>
              </li>
              <li className="breadcrumb-item active">Students management</li>
            </ol>
          </nav>
        </div>
        <div
          style={{
            padding: '2%',
            backgroundColor: '#fff',
            boxShadow: '0px 0px 20px #8c98a4',
          }}
        >
          <Table
            tableName="List of students"
            customView={
              <div
                style={{
                  display: 'flex',
                  gap: '20px',
                  alignItems: 'center',
                }}
              >
                <div style={{ width: '200px' }}>
                  <Select
                    id="grade-filter"
                    options={GRADE_OPTIONS}
                    onChange={handleGradeChange}
                    value={GRADE_OPTIONS.find(
                      (option) => option.value === selectedGrade
                    )}
                    placeholder="Select Grade"
                  />
                </div>
              </div>
            }
            columns={StudentManageColumns}
            data={data}
            onSearch={handleSearch}
            endpoint={ENDPOINT.STUDENT}
            isImportable={false}
            isDeletable={isTeacher() || isAdmin()}
            isEditable={false}
            isToggleable={true}
            onToggleStatus={toggleStatus}
            isTableLoading={isTableLoading}
            loadingMessage="Loading students..."
            trueLabel="Active"
            falseLabel="Inactive"
            customActions={[
              {
                action: 'View learning history',
                link: (row) =>
                  buildRoute(ROUTES.DETAIL_STUDENT, { id: row.student_id }),
              },
              {
                action: 'View statistics',
                link: (row) =>
                  buildRoute(ROUTES.STUDENT_STATISTICS, { id: row.student_id }),
              },
            ]}
          />
          <Pagination
            pageSize={pageSize}
            numOfRecords={totalRecords}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageResize}
            totalPage={totalPages}
          />
        </div>
      </main>
    </>
  );
};

export default Student;
