import { useEffect, useState, useCallback, useMemo } from 'react';
import Table from '../components/Table';
import { toast } from 'react-toastify';
import Pagination from '../components/Pagination';
import { ENDPOINT } from '../routers/endpoint';
import useFetchEBook from '@/hooks/useFetchEBook';
import useFetchEBookCategory from '@/hooks/useFetchEBookCategory';
import useToggleStatus from '@/hooks/useToggleStatus';
import { EBookColumns } from '@/utils/constants/columns/ebookColumns';
import { Constants } from '@/utils/constants/constants';
import { EBookCreateFields } from '@/utils/constants/create_fields/EBookCreateFields';
import EBookEditFields from '@/utils/constants/edit_fields/EBookEditFields';
import Field from '@/types/field';
import { useSearchParams } from 'react-router-dom';
import { STATUS_UC_OPTIONS } from '@/utils/constants/options';

const EBook = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [pageSize, setPageSize] = useState(
    Number(
      localStorage.getItem(`${Constants.LOCAL_STORAGE_KEY}-${ENDPOINT.EBOOK}`)
    ) || 10
  );
  const [searchParams] = useSearchParams();
  const category_id = searchParams.get('category_id');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    category_id
  );

  const [ebookCreateFields, setEbookCreateFields] =
    useState<Field[]>(EBookCreateFields);
  const [ebookEditFields, setEbookEditFields] =
    useState<Field[]>(EBookEditFields);

  const { data, error, totalRecords, totalPages, setParams } = useFetchEBook(
    `${ENDPOINT.EBOOK}`,
    {
      pageNumb: currentPage,
      pageSize: pageSize,
      searchTerm: searchTerm || null,
      category_id: selectedCategory || null,
    }
  );

  const { toggleStatus } = useToggleStatus({
    endpoint: ENDPOINT.EBOOK,
    onSuccess: () => {
      handleParamsChange(currentPage, searchTerm, pageSize, selectedCategory);
    },
  });

  const { data: categories } = useFetchEBookCategory(
    `${ENDPOINT.EBOOK_CATEGORY}/all`,
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

      const updatedCreateFields = EBookCreateFields.map((field) => {
        if (field.name === 'categories' && field.type === 'multi-select') {
          return { ...field, options: categoryOptions };
        }
        return field;
      });

      const updatedEditFields = EBookEditFields.map((field: Field) => {
        if (field.name === 'categories' && field.type === 'multi-select') {
          return { ...field, options: categoryOptions };
        }
        return field;
      });

      setEbookCreateFields(updatedCreateFields);

      setEbookEditFields(updatedEditFields);
    }
  }, [categories]);

  useEffect(() => {
    if (data && data.length >= 0) {
      setIsTableLoading(false);
    }
    if (error) {
      toast.error(error);
    }
  }, [data, error]);

  const handleParamsChange = useCallback(
    (page: number, search: string, size: number, category: string | null) => {
      setIsTableLoading(true);
      setParams({
        pageNumb: page,
        pageSize: size,
        searchTerm: search || null,
        category_id: category,
      });
    },
    [setParams]
  );

  // Tối ưu hóa handlePageResize
  const handlePageResize = useCallback(
    (newSize: number) => {
      localStorage.setItem(
        `${Constants.LOCAL_STORAGE_KEY}-${ENDPOINT.EBOOK}`,
        newSize.toString()
      );
      setPageSize(newSize);
      setCurrentPage(1);
      handleParamsChange(1, searchTerm, newSize, selectedCategory);
    },
    [handleParamsChange, searchTerm, selectedCategory]
  );

  // Tối ưu hóa handleCategoryChange
  const handleCategoryChange = useCallback(
    (val: string | null) => {
      setSelectedCategory(val);
      setCurrentPage(1);
      handleParamsChange(1, searchTerm, pageSize, val);
    },
    [handleParamsChange, searchTerm, pageSize]
  );

  // Tối ưu hóa handleSearch
  const handleSearch = useCallback(
    (term: string) => {
      setSearchTerm(term);
      setCurrentPage(1);
      handleParamsChange(1, term, pageSize, selectedCategory);
    },
    [handleParamsChange, pageSize, selectedCategory]
  );

  // Tối ưu hóa handlePageChange
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      handleParamsChange(page, searchTerm, pageSize, selectedCategory);
    },
    [handleParamsChange, searchTerm, pageSize, selectedCategory]
  );

  const processEditFieldsWithRelations = useCallback(
    (item: any, fields: Field[]) => {
      const processedFields = fields.map((field) => {
        if (field.name === 'categories' && field.type === 'multi-select') {
          let categoryValues = [];
          if (item.categories && Array.isArray(item.categories)) {
            categoryValues = item.categories.map((cat: any) => cat.id);
          } else if (item.category_id) {
            categoryValues = Array.isArray(item.category_id)
              ? item.category_id
              : [item.category_id];
          }
          const processedField = { ...field, value: categoryValues };
          return processedField;
        } else if (field.name === 'is_active') {
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
        <h1>E-books management</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="/dashboard">CMS</a>
            </li>
            <li className="breadcrumb-item active">List e-books</li>
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
            <select
              value={selectedCategory || ''}
              onChange={(e) => {
                const val = e.target.value || null;
                handleCategoryChange(val);
              }}
              className="form-select"
              style={{ width: '200px'}}
            >
              <option value="">All Categories</option>
              {categories?.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.title}
                </option>
              ))}
            </select>
          }
          columns={EBookColumns}
          createFields={ebookCreateFields}
          editFields={ebookEditFields}
          prepareEditFields={processEditFieldsWithRelations}
          data={data}
          onSearch={handleSearch}
          endpoint={ENDPOINT.EBOOK}
          isCreatable={true}
          isImportable={false}
          isToggleable={true}
          onToggleStatus={toggleStatus}
          trueLabel="Active"
          falseLabel="Lock"
          isTableLoading={isTableLoading}
          loadingMessage="Loading e-books..."
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
  );
};

export default EBook;
