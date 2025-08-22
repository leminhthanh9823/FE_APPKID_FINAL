import { useState, useCallback, useEffect } from 'react';
import Table from '../components/Table';
import { toast } from 'react-toastify';
import Pagination from '../components/Pagination';
import { ENDPOINT } from '../routers/endpoint';
import { formatTimestamp } from '@/utils/helper/formatTimeStamp';
import useFetchEBookCategory from '@/hooks/useFetchEBookCategory';
import useToggleStatus from '@/hooks/useToggleStatus';
import Field from '@/types/field';
import { EBookCategoryColumns } from '@/utils/constants/columns/ebookCategoryColumns';
import { EBookCategoryCreateFields } from '@/utils/constants/create_fields/EBookCategoryCreateFields';
import { ROUTES } from '@/routers/routes';

const EBookCategory = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [isTableLoading, setIsTableLoading] = useState(false);

  const { data, error, totalRecords, totalPages, setParams } =
    useFetchEBookCategory(`${ENDPOINT.EBOOK_CATEGORY}/all`, {
      pageNumb: currentPage,
      pageSize: pageSize,
      searchTerm: searchTerm,
    });

  const { toggleStatus } = useToggleStatus({
    endpoint: ENDPOINT.EBOOK_CATEGORY,
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

  const processEditFieldsWithRelations = useCallback(
    (item: any, fields: Field[]) => {
      const processedFields = fields.map((field) => {
        if (field.name === 'is_active') {
          let value = item.is_active;
          if (typeof value === 'string') {
            value = parseInt(value);
          }
          value = Number(value);

          const processedField = { ...field, value: value };
          const matchingOption = field.options?.find(
            (opt) => opt.value === value
          );

          return processedField;
        }
        const processedField = {
          ...field,
          value:
            item[field.name] !== null && item[field.name] !== undefined
              ? item[field.name]
              : field.value,
        };
        return processedField;
      });

      return processedFields;
    },
    []
  );

  return (
    <main className="main" id="main">
      <div className="pagetitle">
        <h1>E-book Categories</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="/dashboard">CMS</a>
            </li>
            <li className="breadcrumb-item active">E-book categories</li>
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
          columns={EBookCategoryColumns}
          createFields={EBookCategoryCreateFields}
          editFields={EBookCategoryCreateFields}
          prepareEditFields={processEditFieldsWithRelations}
          data={data}
          onSearch={handleSearch}
          endpoint={ENDPOINT.EBOOK_CATEGORY}
          isCreatable={true}
          isImportable={false}
          isToggleable={true}
          onToggleStatus={toggleStatus}
          isTableLoading={isTableLoading}
          loadingMessage="Loading categories..."
          customActions={[
            {
              action: 'View E-books',
              link: (row) => {
                return `${ROUTES.EBOOK}?category_id=${row.id}`;
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

export default EBookCategory;
