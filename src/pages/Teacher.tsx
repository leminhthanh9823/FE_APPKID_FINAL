import { useState, useCallback, useEffect } from 'react';
import Table from '../components/Table';
import { toast } from 'react-toastify';
import Pagination from '../components/Pagination';
import { ENDPOINT } from '../routers/endpoint';
import useFetchTeacher from '../hooks/useFetchTeacher';
import useToggleStatus from '@/hooks/useToggleStatus';
import {
  TeacherColumns,
  getTeacherColumns,
} from '../utils/constants/columns/teacherColumns';
import { TeacherEditFields } from '../utils/constants/edit_fields/teacherEditFields';
import useFetchRole from '../hooks/useFetchRole';
import { RoleRecord } from '../types/role';
import Field from '../types/field';
import { TeacherCreateFields } from '../utils/constants/create_fields/teacherCreateFields';
import { Constants } from '@/utils/constants/constants';
import { ROUTES } from '@/routers/routes';
import { useAuth } from '@/hooks/useAuth';

export interface ITeacherRecord {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  status: boolean;
  role_id: number;
  gender: string;
  dob: string;
  image: string | null;
  email_verified_at: string | null;
  created_at: string;
}

const Teacher: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [pageSize, setPageSize] = useState<number>(
    Number(
      localStorage.getItem(
        Constants.LOCAL_STORAGE_KEY + '-' + ENDPOINT.USER + '-teachers'
      )
    ) || 10
  );
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const { isAdmin } = useAuth();

  // Dynamic columns based on role
  const teacherColumns = getTeacherColumns(isAdmin());

  const { data, error, totalRecords, setParams, totalPages } =
    useFetchTeacher<ITeacherRecord>(`${ENDPOINT.USER}/teachers`, {
      pageNumb: currentPage,
      pageSize: pageSize,
      searchTerm: searchTerm === '' ? null : searchTerm,
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
    endpoint: ENDPOINT.USER,
    onSuccess: () => {
      handleParamsChange(currentPage, searchTerm, pageSize, selectedRole);
    },
  });

  const handlePageResize = (newSize: number) => {
    localStorage.setItem(
      Constants.LOCAL_STORAGE_KEY + '-' + ENDPOINT.USER + '-teachers',
      newSize.toString()
    );
    setPageSize(newSize);
    setCurrentPage(1);
    handleParamsChange(1, searchTerm, newSize, selectedRole);
  };

  const { data: roleData } = useFetchRole<RoleRecord>(`${ENDPOINT.ROLE}/all`, {
    pageNumb: null,
    pageSize: null,
    sorts: null,
    name: null,
  });

  const roleOptions = roleData
    ? roleData.map((role) => ({ value: role.role_id, label: role.name }))
    : [];

  const updatedTeacherEditFields: Field[] = TeacherEditFields.map(
    (field: Field) =>
      field.name === 'role_id' ? { ...field, options: roleOptions } : field
  );

  const updatedCreateFields: Field[] = TeacherCreateFields.map(
    (field: Field) =>
      field.name === 'role_id' ? { ...field, options: roleOptions } : field
  );

  const handleParamsChange = useCallback(
    (
      page: number,
      search: string,
      size?: number | null,
      role?: string | null
    ) => {
      setIsTableLoading(true);
      setParams({
        pageNumb: page,
        pageSize: size,
        searchTerm: search === '' ? null : search,
      });
    },
    [setParams]
  );

  const handleSearch = useCallback(
    (term: string) => {
      setSearchTerm(term);
      setCurrentPage(1);
      handleParamsChange(1, term, pageSize, selectedRole);
    },
    [pageSize, selectedRole, handleParamsChange]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      handleParamsChange(page, searchTerm, pageSize, selectedRole);
    },
    [searchTerm, pageSize, selectedRole, handleParamsChange]
  );

  return (
    <>
      <main className="main" id="main">
        <div className="pagetitle">
          <h1>Teachers Management</h1>
          <nav>
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <a href={ROUTES.DASHBOARD}>CMS</a>
              </li>
              <li className="breadcrumb-item active">Teachers</li>
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
          {/* Table */}
          <Table
            tableName="List of teachers"
            columns={teacherColumns}
            data={data}
            editFields={updatedTeacherEditFields}
            createFields={updatedCreateFields}
            onSearch={handleSearch}
            endpoint={ENDPOINT.USER}
            isCreatable={isAdmin()}
            isImportable={false}
            isDeletable={isAdmin()}
            isEditable={isAdmin()}
            isToggleable={isAdmin()}
            onToggleStatus={toggleStatus}
            isTableLoading={isTableLoading}
            loadingMessage="Loading teachers..."
            trueLabel="Active"
            falseLabel="Inactive"
          />

          {/* Pagination */}
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

export default Teacher;
