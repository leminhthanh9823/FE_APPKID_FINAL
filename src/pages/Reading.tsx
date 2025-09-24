import { useEffect, useState, useCallback } from 'react';
import Table from '../components/Table';
import { toast } from 'react-toastify';
import Pagination from '../components/Pagination';
import { ENDPOINT } from '../routers/endpoint';
import { ReadingRecord } from '../types/reading';
import useFetchReading from '../hooks/useFetchReading';
import useToggleStatus from '@/hooks/useToggleStatus';
import { ReadingColumns } from '../utils/constants/columns/readingColumns';
import { ReadingCreateFields } from '../utils/constants/create_fields/readingCreateFields';
import { Constants } from '@/utils/constants/constants';
import Select from 'react-select';
import { DIFFICULTY_OPTIONS, STATUS_OPTIONS } from '@/utils/constants/options';
import { ROUTES } from '@/routers/routes';
import { buildRoute } from '@/utils/helper/routeHelper';
import useFetchEBookCategory from '@/hooks/useFetchEBookCategory';
import Field from '@/types/field';
import { useSearchParams } from 'react-router-dom';
import { ReadingEditFields } from '@/utils/constants/edit_fields/readingEditFields';

const Reading: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [pageSize, setPageSize] = useState<number>(
    Number(
      localStorage.getItem(Constants.LOCAL_STORAGE_KEY + '-' + ENDPOINT.READING)
    ) || 10
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [readingCreateFields, setReadingCreateFields] =
    useState<Field[]>(ReadingCreateFields);
  const [readingEditFields, setReadingEditFields] =
    useState<Field[]>(ReadingEditFields);
  const [searchParams] = useSearchParams();
  const category_id = searchParams.get('category_id');

  useEffect(() => {
    if (category_id && !selectedCategory) {
      setSelectedCategory(category_id);
    }
  }, [category_id, selectedCategory]);

  const endpoint = selectedCategory
    ? `${ENDPOINT.READING}/category/${selectedCategory}`
    : `${ENDPOINT.READING}/all`;

  const { data, error, totalRecords, setParams, totalPages } =
    useFetchReading<ReadingRecord>(endpoint, {
      pageNumb: currentPage,
      pageSize: pageSize,
      sorts: null,
      searchTerm: searchTerm === '' ? null : searchTerm,
      is_active: selectedStatus,
      difficulty_level: selectedDifficulty,
    });

  const { toggleStatus } = useToggleStatus({
    endpoint: ENDPOINT.READING,
    onSuccess: () => {
      handleParamsChange(
        currentPage,
        searchTerm,
        pageSize,
        selectedStatus
      );
    },
  });

  const { data: categories } = useFetchEBookCategory(
    `${ENDPOINT.READING_CATEGORY}/all`,
    {
      pageNumb: 1,
      pageSize: 100,
      searchTerm: null,
    }
  );

  useEffect(() => {
    if (categories && categories.length > 0) {
      const categoryOptions = categories.map((cat: any) => ({
        label: cat.title,
        value: cat.id,
      }));

      const updatedCreateFields = ReadingCreateFields.map((field) => {
        if (field.name === 'category_id' && field.type === 'select') {
          return { ...field, options: categoryOptions };
        }

        return field;
      });

      const updatedEditFields = ReadingEditFields.map((field) => {
        if (field.name === 'category' && field.type === 'select') {
          return { ...field, options: categoryOptions };
        }

        return field;
      });

      setReadingCreateFields(updatedCreateFields);
      setReadingEditFields(updatedEditFields);
    }
  }, [categories]);

  useEffect(() => {
    if (data && data.length >= 0) {
      setIsTableLoading(false);
    }
  }, [data]);

  const handleParamsChange = useCallback(
    (
      page: number,
      search: string,
      size: number,
      status: number | null,
      difficulty?: number | null
    ) => {
      setIsTableLoading(true);
      setParams({
        pageNumb: page,
        pageSize: size,
        sorts: null,
        searchTerm: search === '' ? null : search,
        is_active: status,
        difficulty_level: typeof difficulty !== 'undefined' ? difficulty : selectedDifficulty,
      });
    },
    [setParams, selectedDifficulty]
  );

  useEffect(() => {
    handleParamsChange(
      currentPage,
      searchTerm,
      pageSize,
      selectedStatus,
      selectedDifficulty
    );
    if (error) toast.error(error);
  }, [
    currentPage,
    pageSize,
    searchTerm,
    selectedStatus,
    selectedCategory,
    handleParamsChange,
    error,
  ]);

  const handlePageResize = useCallback((newSize: number) => {
    localStorage.setItem(
      Constants.LOCAL_STORAGE_KEY + '-' + ENDPOINT.READING,
      newSize.toString()
    );
    setPageSize(newSize);
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback(
    (selectedOption: { value: number | null; label: string } | null) => {
      const newStatus = selectedOption ? selectedOption.value : null;
      setSelectedStatus(newStatus);
      setCurrentPage(1);
    },
    []
  );

  const handleCategoryChange = useCallback((val: string | null) => {
    setSelectedCategory(val);
    setCurrentPage(1);
  }, []);

  const handleSearch = useCallback((searchTerm: string) => {
    setSearchTerm(searchTerm);
    setCurrentPage(1);
    handleParamsChange(1, searchTerm, pageSize, selectedStatus);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleDifficultyChange = useCallback(
    (selectedOption: { value: number | null; label: string } | null) => {
      const newDifficulty = selectedOption ? selectedOption.value : null;
      setSelectedDifficulty(newDifficulty);
      setCurrentPage(1);
    }
    , []);

  return (
    <>
      <main className="main" id="main">
        <div className="pagetitle">
          <h1>Reading</h1>
          <nav>
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <a href={`${ROUTES.DASHBOARD}`}>CMS</a>
              </li>
              <li className="breadcrumb-item active">Reading Management</li>
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
            tableName="Readings"
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
                    id="status-filter"
                    options={DIFFICULTY_OPTIONS}
                    onChange={handleDifficultyChange}
                    value={DIFFICULTY_OPTIONS.find(
                      (option) => option.value === selectedDifficulty
                    )}
                    placeholder="Select Difficulty"
                  />
                </div>
                <div style={{ width: '200px' }}>
                  <select
                    value={selectedCategory || ''}
                    onChange={(e) => {
                      const val = e.target.value || null;
                      handleCategoryChange(val);
                    }}
                    className="form-select"
                    style={{ width: '100%', padding: '8px' }}
                  >
                    <option value="">All Categories</option>
                    {categories?.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ width: '200px' }}>
                  <Select
                    id="status-filter"
                    options={STATUS_OPTIONS}
                    onChange={handleStatusChange}
                    value={STATUS_OPTIONS.find(
                      (option) => option.value === selectedStatus
                    )}
                    placeholder="Select Status"
                  />
                </div>
              </div>
            }
            createFields={readingCreateFields}
            editFields={readingEditFields}
            columns={ReadingColumns}
            data={data}
            onSearch={handleSearch}
            endpoint={ENDPOINT.READING}
            isCreatable={true}
            isImportable={false}
            isToggleable={true}
            onToggleStatus={toggleStatus}
            isTableLoading={isTableLoading}
            loadingMessage="Loading readings..."
            trueLabel="Active"
            falseLabel="Inactive"
            customActions={[
              {
                action: 'View questions',
                link: (row) => buildRoute(ROUTES.QUESTIONS, { id: row.id }),
              },
              {
                action: 'View games',
                link: (row) => buildRoute(ROUTES.GAMES_BY_READING, { id: row.id }),
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

export default Reading;
