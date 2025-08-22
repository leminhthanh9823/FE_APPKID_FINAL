import { useState, useCallback, useEffect } from 'react';
import Table from '../components/Table';
import { toast } from 'react-toastify';
import Pagination from '../components/Pagination';
import { ENDPOINT } from '../routers/endpoint';
import { ROUTES } from '../routers/routes';
import { ReadingCategoryReportColumns } from '@/utils/constants/columns/readingCategoryReportColumns';
import useFetchReadingCategoryStats from '@/hooks/useFetchReadingCategoryStats';
import { Constants } from '@/utils/constants/constants';

const ReadingCategoryReport: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState<number>(
    Number(
      localStorage.getItem(
        Constants.LOCAL_STORAGE_KEY + '-' + ENDPOINT.READING_CATEGORY_STATS
      )
    ) || 10
  );
  const [isTableLoading, setIsTableLoading] = useState(false);

  const { data, error, totalRecords, totalPages, setParams } =
    useFetchReadingCategoryStats(ENDPOINT.READING_CATEGORY_STATS, {
      pageNumb: currentPage,
      pageSize: pageSize,
      searchTerm: searchTerm || null,
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
      setParams({
        pageNumb: page,
        pageSize: size,
        searchTerm: search || null,
      });
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
      localStorage.setItem(
        Constants.LOCAL_STORAGE_KEY + '-' + ENDPOINT.READING_CATEGORY_STATS,
        size.toString()
      );
      setPageSize(size);
      setCurrentPage(1);
      handleParamsChange(1, searchTerm, size);
    },
    [handleParamsChange, searchTerm]
  );

  return (
    <main className="main" id="main">
      <div className="pagetitle">
        <h1>Reading Statistic</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href={ROUTES.DASHBOARD}>CMS</a>
            </li>
            <li className="breadcrumb-item">
              <a href={ROUTES.READING_CATEGORY_REPORT}>Reading Statistic</a>
            </li>
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
          tableName=""
          columns={ReadingCategoryReportColumns}
          data={data}
          onSearch={handleSearch}
          endpoint=""
          isCreatable={false}
          isImportable={false}
          isDeletable={false}
          isEditable={false}
          isToggleable={false}
          isTableLoading={isTableLoading}
          loadingMessage="Loading reading categories statistics..."
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

export default ReadingCategoryReport;
