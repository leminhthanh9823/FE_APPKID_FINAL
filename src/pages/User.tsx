import { useState, useCallback, useEffect } from 'react';
import Table from '../components/Table';
import { toast } from 'react-toastify';
import Pagination from '../components/Pagination';
import { ENDPOINT } from '../routers/endpoint';
import { UserRecord } from '../types/user';
import useFetchUser from '../hooks/useFetchUser';
import useToggleStatus from '@/hooks/useToggleStatus';
import {
  UserColumns,
  getUserColumns,
} from '../utils/constants/columns/userColumns';
import { UserEditFields } from '../utils/constants/edit_fields/userEditFields';
import useFetchRole from '../hooks/useFetchRole';
import { RoleRecord } from '../types/role';
import Field from '../types/field';
import { UserCreateFields } from '../utils/constants/create_fields/userCreateFields';
import { Constants } from '@/utils/constants/constants';
import { UserChangePassAction } from '@/utils/constants/custom_actions/userCustomAction';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '@/hooks/useAuth';
import RoleGuard from '@/components/RoleGuard';
import { UserRole } from '@/routers/PrivateRoute';

interface JwtPayload {
  user_id?: number;
}

const getUserId = () => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return [];

    const decoded = jwtDecode<JwtPayload>(token);
    if (!decoded.user_id) return;

    return decoded.user_id;
  } catch (error) {
    return;
  }
};

const User: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [pageSize, setPageSize] = useState<number>(
    Number(
      localStorage.getItem(Constants.LOCAL_STORAGE_KEY + '-' + ENDPOINT.USER)
    ) || 10
  );
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const { isAdmin, isTeacher } = useAuth();

  // Dynamic columns based on role
  const userColumns = getUserColumns(isAdmin());

  const { data, error, totalRecords, setParams, totalPages } =
    useFetchUser<UserRecord>(`${ENDPOINT.USER}/all`, {
      pageNumb: currentPage,
      pageSize: pageSize,
      sorts: null,
      searchTerm: searchTerm === '' ? null : searchTerm,
      role_id: selectedRole === '' ? null : selectedRole,
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

  const userId = getUserId();
  const filteredData = data ? data.filter((user) => user.id != userId) : [];

  const handlePageResize = (newSize: number) => {
    localStorage.setItem(
      Constants.LOCAL_STORAGE_KEY + '-' + ENDPOINT.USER,
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

  const updatedUserEditFields: Field[] = UserEditFields.map((field) =>
    field.name === 'role_id' ? { ...field, options: roleOptions } : field
  );

  const updatedCreateFields: Field[] = UserCreateFields.map((field) =>
    field.name === 'role_id' ? { ...field, options: roleOptions } : field
  );

  const handleParamsChange = (
    page: number,
    searchTerm: string,
    pagesize?: number | null,
    role_id?: string | null
  ) => {
    setIsTableLoading(true);
    setParams({
      pageNumb: page,
      pageSize: pagesize,
      sorts: null,
      searchTerm: searchTerm === '' ? null : searchTerm,
      role_id: role_id === '' ? null : role_id,
    });

    if (error) {
      toast.error(error);
    }
  };

  return (
    <>
      <main className="main" id="main">
        <div className="pagetitle">
          <h1>User</h1>
          <nav>
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <a href="/dashboard">CMS</a>
              </li>
              <li className="breadcrumb-item active">Users</li>
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
          {/* Filter by Role */}
          

          {/* Table */}
          <Table
            customView={
              <select
                id="roleFilter"
                value={selectedRole || ''}
                onChange={(e) => {
                  const value = e.target.value || null;
                  setSelectedRole(value);
                  setCurrentPage(1);
                  handleParamsChange(1, searchTerm, pageSize, value);
                }}
                className="form-select"
                style={{ width: '200px'}}
              >
                <option value="">All Roles</option>
                {roleOptions.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            }
            tableName="User list"
            createFields={updatedCreateFields}
            columns={userColumns} // Sử dụng dynamic columns
            data={filteredData}
            editFields={updatedUserEditFields}
            onSearch={(searchTerm: string) => {
              setSearchTerm(searchTerm);
              setCurrentPage(1);
              handleParamsChange(1, searchTerm, pageSize, selectedRole);
            }}
            endpoint={ENDPOINT.USER}
            isCreatable={isAdmin()} // Only Admin can create users
            isImportable={false}
            isDeletable={isAdmin()} // Only Admin can delete users
            isEditable={isAdmin()} // Only Admin can edit users
            isToggleable={isAdmin()} // Chỉ Admin mới được toggle status
            onToggleStatus={toggleStatus}
            isTableLoading={isTableLoading}
            loadingMessage="Loading users..."
            trueLabel="Active"
            falseLabel="Inactive"
            customActions={isAdmin() ? UserChangePassAction : []}
          />

          {/* Pagination */}
          <Pagination
            pageSize={pageSize}
            numOfRecords={totalRecords}
            currentPage={currentPage}
            onPageChange={(page: number) => {
              setCurrentPage(page);
              handleParamsChange(page, searchTerm, pageSize, selectedRole);
            }}
            onPageSizeChange={handlePageResize}
            totalPage={totalPages}
          />
        </div>
      </main>
    </>
  );
};

export default User;
