import Table from '@/components/Table';
import useFetchFeedbackAdmin from '@/hooks/feedback/useFetchFeedbackAdmin';
import { ENDPOINT } from '@/routers/endpoint';
import { ROUTES } from '@/routers/routes';
import { FeedbackColumns } from '@/utils/constants/columns/feedback/feedbackColumns';
import { Constants } from '@/utils/constants/constants';
import { FEEDBACK_CATEGORY_OPTIONS } from '@/utils/constants/options';
import { buildRoute } from '@/utils/helper/routeHelper';
import { useState, useCallback, useEffect } from 'react';
import Select from 'react-select';

const FeedbackTeacher: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(
    Number(
      localStorage.getItem(`${Constants.LOCAL_STORAGE_KEY}-${ENDPOINT.FEEDBACK}/cms/get-feedbacks`)
    ) || 10
  );
  const [selectedFeedbackCategoryId, setSelectedFeedbackCategoryId] = useState<number | null>(null);  

  const { data, error, totalRecords, setParams, totalPages } =
    useFetchFeedbackAdmin(`${ENDPOINT.FEEDBACK}/cms/get-feedbacks`, {
      pageNumb: currentPage,
      pageSize: pageSize,
      searchTerm: searchTerm === '' ? null : searchTerm,
      feedback_category_id: selectedFeedbackCategoryId,
  });

  const handleParamsChange = useCallback((
    page: number,
    search: string,
    size: number,
    categoryId: number | null
  ) => {
    setParams({
      pageNumb: page,
      pageSize: size,
      searchTerm: search || null,
      feedback_category_id: categoryId,
    });
  }, []);

 const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    handleParamsChange(page, searchTerm, pageSize, selectedFeedbackCategoryId);
  }, []);

  const handlePageResize = useCallback((newSize: number) => {
    localStorage.setItem(
      Constants.LOCAL_STORAGE_KEY + '-' + ENDPOINT.FEEDBACK + '/cms/get-feedbacks',
      newSize.toString()
    );
    setPageSize(newSize);
    setCurrentPage(1);
    handleParamsChange(1, searchTerm, newSize, selectedFeedbackCategoryId);
  }, []);

  const handleSearch = useCallback((searchTerm: string) => {
    setSearchTerm(searchTerm);
    setCurrentPage(1);
    handleParamsChange(1, searchTerm, pageSize, selectedFeedbackCategoryId);
  }, []);

  const handleCateChange = useCallback(
    (selectedOption: { value: number | null; label: string } | null) => {
      const newCategory = selectedOption ? selectedOption.value : null;
      setSelectedFeedbackCategoryId(newCategory);
      setCurrentPage(1);
      handleParamsChange(1, searchTerm, pageSize, newCategory);
    },
    []
  );

  return (
    <main className="main" id="main">
      <div className="pagetitle">
        <h1>Feedback management</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href={ROUTES.DASHBOARD}>CMS</a>
            </li>
            <li className="breadcrumb-item active">Feedback management</li>
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
          tableName="List of feedbacks"
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
                  options={FEEDBACK_CATEGORY_OPTIONS}
                  onChange={handleCateChange}
                  value={FEEDBACK_CATEGORY_OPTIONS.find(
                    (option) => option.value === selectedFeedbackCategoryId
                  )}
                  placeholder="Select category feedback"
                />
              </div>
            </div>
          }
          columns={FeedbackColumns}
          data={data}
          onSearch={(term) => {
            handleSearch(term);
          }}
          endpoint={ENDPOINT.USER}
          isCreatable={false}
          isImportable={false}
          isDeletable={true}
          isEditable={false}
          customActions={[
            {
            action: 'Detail & Assign',
            link: (row) => buildRoute(ROUTES.FEEDBACK_TEACHER_DETAIL, { id: row.id}) 
            }
          ]}
          isToggleable={true}
          loadingMessage="Loading teachers..."
          trueLabel="Active"
          falseLabel="Inactive"
        />
      </div>
    </main>
  )
}
export default FeedbackTeacher;