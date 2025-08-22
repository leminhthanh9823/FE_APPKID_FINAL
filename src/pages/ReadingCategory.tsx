import { useState, useCallback, useEffect } from 'react';
import Table from '../components/Table';
import { toast } from 'react-toastify';
import Pagination from '../components/Pagination';
import { ENDPOINT } from '../routers/endpoint';
import useFetchEBookCategory from '@/hooks/useFetchEBookCategory';
import useToggleStatus from '@/hooks/useToggleStatus';
import { ROUTES } from '@/routers/routes';
import { ReadingCategoryCreateFields } from '@/utils/constants/create_fields/ReadingCategoryCreateFields';
import { ReadingCategoryColumns } from '@/utils/constants/columns/ReadingCategoryColumns';

const ReadingCategory = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [isTableLoading, setIsTableLoading] = useState(false);

  const { data, error, totalRecords, totalPages, setParams } =
    useFetchEBookCategory(`${ENDPOINT.READING_CATEGORY}/all`, {
      pageNumb: currentPage,
      pageSize: pageSize,
      searchTerm: searchTerm,
    });

  const { toggleStatus } = useToggleStatus({
    endpoint: ENDPOINT.READING_CATEGORY,
    onSuccess: () => {
      handleParamsChange(currentPage, searchTerm, pageSize);
    },
  });

  useEffect(() => {
    if (data && data.length >= 0) {
      setIsTableLoading(false);
    }
    if (error) {
      toast.error(error);
    }
  }, [data, error]);

  const handleParamsChange = useCallback(
    (page: number, search: string, size: number) => {
      setIsTableLoading(true);
      setParams({ pageNumb: page, pageSize: size, searchTerm: search });
    },
    [setParams]
  );

  const handleSearch = useCallback(
    (term: string) => {
      setSearchTerm(term);
      setCurrentPage(1);
      handleParamsChange(1, term, pageSize);
    },
    [handleParamsChange, pageSize]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      handleParamsChange(page, searchTerm, pageSize);
    },
    [handleParamsChange, searchTerm, pageSize]
  );

  const handlePageSizeChange = useCallback(
    (size: number) => {
      setPageSize(size);
      setCurrentPage(1);
      handleParamsChange(1, searchTerm, size);
    },
    [handleParamsChange, searchTerm]
  );

  return (
    <main className="main" id="main">
      <div className="pagetitle">
        <h1>Reading Categories</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="/dashboard">CMS</a>
            </li>
            <li className="breadcrumb-item active">Reading categories</li>
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
          tableName="List categories"
          columns={ReadingCategoryColumns}
          createFields={ReadingCategoryCreateFields}
          editFields={ReadingCategoryCreateFields}
          data={data}
          onSearch={handleSearch}
          endpoint={ENDPOINT.READING_CATEGORY}
          isCreatable={true}
          isImportable={false}
          isToggleable={true}
          onToggleStatus={toggleStatus}
          isTableLoading={isTableLoading}
          loadingMessage="Loading reading categories..."
          customActions={[
            {
              action: 'View readings',
              link: (row) => {
                return `${ROUTES.READING}?category_id=${row.id}`;
              },
            },
          ]}
        />
        <Pagination
          pageSize={pageSize}
          numOfRecords={totalRecords}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          totalPage={totalPages}
        />
      </div>
    </main>
  );
};

export default ReadingCategory;
