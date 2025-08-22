import { useEffect, useState } from 'react';
import Table from '../../components/Table';
import Pagination from '../../components/Pagination';
import { ENDPOINT } from '../../routers/endpoint';
import useFetchNotifications from '@/hooks/notification/useFetchNotifications';
import { Constants } from '@/utils/constants/constants';
import { NotificationColumn } from '@/utils/constants/columns/notification/notificationColumn';
import { ROUTES } from '@/routers/routes';
import { TYPE_NOTIFY_OPTIONS, TYPE_NOTIFY_UC_OPTIONS } from '@/utils/constants/options';
import Select from 'react-select';
import { buildRoute } from '@/utils/helper/routeHelper';
import useToggleStatus from '@/hooks/useToggleStatus';
import { toast } from 'react-toastify';

const Notifications = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [pageSize, setPageSize] = useState(
    Number(
      localStorage.getItem(`${Constants.LOCAL_STORAGE_KEY}-${ENDPOINT.NOTIFY}-All`)
    ) || 10
  );

  const { data, error, totalRecords, totalPages, setParams } = useFetchNotifications(
    `${ENDPOINT.NOTIFY}/cms/all`,
    {
      pageNumb: currentPage,
      pageSize: pageSize,
      searchTerm: searchTerm || null,
    }
  );

  useEffect(() => {
      if (data && data.length >= 0) {
        setIsTableLoading(false);
      }
      if (error) {
        toast.error(error);
      }
    }, [data, error]);

  const handleParamsChange = (
    page: number,
    search: string,
    size: number,
    selectedType?: number | null,
  ) => {
    setIsTableLoading(true);
    setParams({
      pageNumb: page,
      pageSize: size,
      searchTerm: search || null,
      type: selectedType,
    });
  };

  const handlePageResize = (newSize: number) => {
    localStorage.setItem(
      `${Constants.LOCAL_STORAGE_KEY}-${ENDPOINT.NOTIFY}`,
      newSize.toString()
    );
    setPageSize(newSize);
    setCurrentPage(1);
    handleParamsChange(1, searchTerm, newSize);
  };

  const { toggleStatus } = useToggleStatus({
    endpoint: ENDPOINT.NOTIFY,
    onSuccess: () => {
      handleParamsChange(currentPage, searchTerm, pageSize);
    },
  });


  return (
    <main className="main" id="main">
      <div className="pagetitle">
        <h1>Notifications</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="/dashboard">CMS</a>
            </li>
            <li className="breadcrumb-item active">Notifications</li>
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
          tableName="Manage notifications"
          columns={NotificationColumn}
          isEditable={false}
          isDeletable={false}
          data={data}
          onSearch={(term) => {
            setSearchTerm(term);
            setCurrentPage(1);
            handleParamsChange(1, term, pageSize);
          }}
          endpoint={ENDPOINT.NOTIFY}
          isCreatable={true}
          isImportable={false}
          isToggleable={true}
          onToggleStatus={toggleStatus}
          trueLabel="Active"
          falseLabel="Lock"
          customCreate={{
            action: "Create notification",
            link: () => ROUTES.CREATE_NOTIFICATION,
          }}
          customActions={[{
            action: "Edit notification",
            link: (row) => buildRoute(ROUTES.EDIT_NOTIFICATION, { id: row.id }),
          }]}
          isTableLoading={isTableLoading}
          loadingMessage="Loading Notifications..."
        />

        <Pagination
          pageSize={pageSize}
          numOfRecords={totalRecords}
          currentPage={currentPage}
          onPageChange={(page) => {
            setCurrentPage(page);
            handleParamsChange(page, searchTerm, pageSize);
          }}
          onPageSizeChange={handlePageResize}
          totalPage={totalPages}
        />
      </div>

    </main>
  );
}

export default Notifications;