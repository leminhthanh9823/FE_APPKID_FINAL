import { useState, useCallback } from 'react';
import Pagination from '@/components/Pagination';
import Table from '@/components/Table';
import useToggleStatus from '@/hooks/useToggleStatus';
import { Constants } from '@/utils/constants/constants';
import { DIFFICULTY_OPTIONS, STATUS_OPTIONS } from '@/utils/constants/options';
import Select from 'react-select';
import { ENDPOINT } from '@/routers/endpoint';
import useFetchLearningPath from '@/hooks/useFetchLearningPath';
import { LearningPathColumns } from '@/utils/constants/columns/learningPath/learningPathColumns';
import LearningPathCreateFields from '@/utils/constants/create_fields/LearningPathCreateFields';
import { buildRoute } from '@/utils/helper/routeHelper';
import { ROUTES } from '@/routers/routes';
import Field from '@/types/field';
const LearningPaths = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficultLevel, setSelectedDifficultLevel] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
  const [pageSize, setPageSize] = useState(
    Number(
      localStorage.getItem(`${Constants.LOCAL_STORAGE_KEY}-${ENDPOINT.LEARNING_PATH}`)
    ) || 10
  );
  const { data, totalRecords, totalPages, setParams } = useFetchLearningPath(
    `${ENDPOINT.LEARNING_PATH}/cms/all`,
    {
      pageNumb: currentPage,
      pageSize: pageSize,
      searchTerm: searchTerm || null,
      difficulty_level: selectedDifficultLevel ?? null,
      is_active: selectedStatus ?? null,
    }
  );

  const { toggleStatus } = useToggleStatus({
    endpoint: ENDPOINT.LEARNING_PATH,
    onSuccess: () => {
      handleParamsChange(currentPage, pageSize, searchTerm, selectedDifficultLevel, selectedStatus);
    },
  });

  const handleParamsChange = (
    page: number,
    size: number,
    search: string,
    difficulty_level?: number | null,
    isActive?: number | null,
  ) => {
    setParams({
      pageNumb: page,
      pageSize: size,
      searchTerm: search || null,
      difficulty_level: difficulty_level ?? null,
      is_active: isActive ?? null,
    });
  };

  const handleStatusChange = useCallback(
    (selectedOption: { value: number | null; label: string } | null) => {
      const newStatus = selectedOption ? selectedOption.value : null;
      setSelectedStatus(newStatus);
      setCurrentPage(1);
      handleParamsChange(1, pageSize, searchTerm, selectedDifficultLevel, newStatus);
    },
    []
  );

  const handleDifficultyChange = useCallback(
    (selectedOption: { value: number | null; label: string } | null) => {
      const newDifficulty = selectedOption ? selectedOption.value : null;
      setSelectedDifficultLevel(newDifficulty);
      setCurrentPage(1);
      handleParamsChange(1, pageSize, searchTerm, newDifficulty, selectedStatus);
    },
    []
  );

  const handlePageResize = (newSize: number) => {
    localStorage.setItem(
      `${Constants.LOCAL_STORAGE_KEY}-${ENDPOINT.NOTIFY}`,
      newSize.toString()
    );
    setPageSize(newSize);
    setCurrentPage(1);
    handleParamsChange(1, newSize, searchTerm, selectedDifficultLevel, selectedStatus);
  };

  return (
    <main className="main" id="main">
      <div className="pagetitle">
        <h1>Learning Paths Management</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="/dashboard">CMS</a>
            </li>
            <li className="breadcrumb-item active">Learning Paths</li>
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
          customView={
            <div
              style={{
                display: 'flex',
                gap: '20px',
                alignItems: 'left',
              }}
            >
              <div style={{ width: '200px' }}>
                  <Select
                    id="status-filter"
                    options={DIFFICULTY_OPTIONS}
                    onChange={handleDifficultyChange}
                    value={DIFFICULTY_OPTIONS.find(
                      (option) => option.value === selectedDifficultLevel
                    )}
                    placeholder="Difficulty"
                  />
                </div>
              <div style={{ width: '200px' }}>
                  <Select
                    id="status-filter"
                    options={STATUS_OPTIONS}
                    onChange={handleStatusChange}
                    value={STATUS_OPTIONS.find(
                      (option) => option.value === selectedStatus
                    )}
                    placeholder="Status"
                  />
                </div>
            </div>
          }
          createFields={LearningPathCreateFields}
          columns={LearningPathColumns}
          isEditable={false}
          isDeletable={false}
          data={data}
          onSearch={(term) => {
            setSearchTerm(term);
            setCurrentPage(1);
            handleParamsChange(1, pageSize, term, selectedDifficultLevel, selectedStatus);
          }}
          endpoint={ENDPOINT.LEARNING_PATH}
          isCreatable={true}
          isImportable={false}
          isToggleable={true}
          onToggleStatus={toggleStatus}
          customActions={[
            {
              action: "Edit info",
              link: (row) => buildRoute(ROUTES.EDIT_LEARNING_PATH, { id: row.id }),
            },
            {
              action: "Edit items",
              link: (row) => buildRoute(ROUTES.EDIT_ITEMS_LEARNING_PATH, { id: row.id }),
            }
          ]}
          trueLabel="Active"
          falseLabel="Lock"
        />

        <Pagination
          pageSize={pageSize}
          numOfRecords={totalRecords}
          currentPage={currentPage}
          onPageChange={(page) => {
            setCurrentPage(page);
            handleParamsChange(page, pageSize, searchTerm, selectedDifficultLevel, selectedStatus);
          }}
          onPageSizeChange={handlePageResize}
          totalPage={totalPages}
        />
      </div>

    </main>
  );
};

export default LearningPaths;