import { useState, useCallback, useEffect } from 'react';
import Table from '../components/Table';
import { toast } from 'react-toastify';
import Pagination from '../components/Pagination';
import { ENDPOINT } from '../routers/endpoint';
import { Constants } from '@/utils/constants/constants';
import useFetchQuestion from '@/hooks/useFetchQuestion';
import useToggleStatus from '@/hooks/useToggleStatus';
import { QuestionRecord } from '@/types/question';
import { QuestionColumns } from '@/utils/constants/columns/questionColumns';
import { useParams } from 'react-router-dom';
import { ROUTES } from '@/routers/routes';
import { buildRoute } from '@/utils/helper/routeHelper';

const Question: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isTableLoading, setIsTableLoading] = useState(false);
  const { id: readingId } = useParams<{ id: string }>();
  const [pageSize, setPageSize] = useState<number>(
    Number(
      localStorage.getItem(
        Constants.LOCAL_STORAGE_KEY +
          '-' +
          ENDPOINT.QUESTIONS +
          '/reading'
      )
    ) || 10
  );

  const { data, error, totalRecords, setReqBody, totalPages } =
    useFetchQuestion<QuestionRecord>(
      `${ENDPOINT.QUESTIONS}/cms/get-by-readingId`,
      {
        pageNumb: currentPage,
        pageSize: pageSize,
        sorts: null,
        searchTerm: searchTerm === '' ? null : searchTerm,
        is_active: true,
        readingId: readingId ? Number(readingId) : null,
      }
    );

  const { toggleStatus } = useToggleStatus({
    endpoint: ENDPOINT.QUESTIONS,
    onSuccess: () => {
      handleReqChange(currentPage, searchTerm, pageSize, true);
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

  const handleReqChange = useCallback(
    (
      page: number,
      searchTerm: string,
      pagesize?: number | null,
      isActive?: boolean | null
    ) => {
      setIsTableLoading(true);
      setReqBody({
        pageNumb: page,
        pageSize: pagesize,
        sorts: null,
        searchTerm: searchTerm === '' ? null : searchTerm,
        is_active: isActive,
        readingId: readingId ? Number(readingId) : null,
      });
    },
    [setReqBody, readingId]
  );

  const handlePageResize = useCallback(
    (newSize: number) => {
      localStorage.setItem(
        Constants.LOCAL_STORAGE_KEY + '-' + ENDPOINT.QUESTIONS,
        newSize.toString()
      );
      setPageSize(newSize);
      setCurrentPage(1);
      handleReqChange(1, searchTerm, newSize, true);
    },
    [searchTerm, handleReqChange]
  );

  const handleSearch = useCallback(
    (term: string) => {
      setSearchTerm(term);
      setCurrentPage(1);
      handleReqChange(1, term, pageSize, true);
    },
    [pageSize, handleReqChange]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      handleReqChange(page, searchTerm, pageSize, true);
    },
    [searchTerm, pageSize, handleReqChange]
  );

  return (
    <>
      <main className="main" id="main">
        <div className="pagetitle">
          <h1>Questions</h1>
          <nav>
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <a href="/dashboard">CMS</a>
              </li>
              <li className="breadcrumb-item">
                <a href={`${ROUTES.READING}`}>Reading</a>
              </li>
              <li className="breadcrumb-item active">Questions</li>
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
            tableName="Question list"
            isEditable={false}
            isDeletable={false}
            columns={QuestionColumns}
            data={data}
            onSearch={handleSearch}
            endpoint={ENDPOINT.QUESTIONS}
            isCreatable={true}
            isImportable={false}
            customCreate={{
              action: 'Create question',
              link: () =>
                buildRoute(ROUTES.CREATE_QUESTION, {
                  kid_reading_id: readingId || '',
                }),
            }}
            isToggleable={true}
            onToggleStatus={toggleStatus}
            isTableLoading={isTableLoading}
            loadingMessage="Loading questions..."
            trueLabel="Active"
            falseLabel="Inactive"
            customActions={[
              {
                action: 'Edit question',
                link: (row) =>
                  buildRoute(ROUTES.EDIT_QUESTION, {
                    id: row.id,
                    kid_reading_id: readingId || '',
                  }),
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

export default Question;
