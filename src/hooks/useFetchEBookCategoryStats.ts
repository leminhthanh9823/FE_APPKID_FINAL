import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../apis/apiRequest';
import { useLoading } from './useLoading';
import { MESSAGE } from '@/utils/constants/errorMessage';
import { toast } from 'react-toastify';

interface FetchParams {
  pageNumb?: number | null;
  pageSize?: number | null;
  searchTerm?: string | null;
}

interface EBookCategoryStats {
  id: number;
  title: string;
  description: string;
  image: string;
  icon: string;
  is_active: number;
  created_at: string;
  updated_at: string;
  statistics: {
    total_ebooks: number;
  };
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    records: EBookCategoryStats[];
    total_record: number;
    total_page: number;
  };
}

const useFetchEBookCategoryStats = (
  endpoint: string,
  initialParams: FetchParams
) => {
  const [data, setData] = useState<EBookCategoryStats[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { setIsLoading } = useLoading();
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<FetchParams>(initialParams);
  const isFirstRender = useRef(true);

  const fetchData = useCallback(
    async (requestParams: FetchParams) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.post<ApiResponse>(
          endpoint,
          requestParams
        );
        if (response.data.success) {
          setData(response.data.data.records);
          setTotalRecords(response.data.data.total_record);
          setTotalPages(response.data.data.total_page);
        }
      } catch (err: any) {
        toast.error(err || MESSAGE.SERVER_CONNECTION_ERROR);
        setError(
          err || MESSAGE.SERVER_CONNECTION_ERROR
        );
      } finally {
        setIsLoading(false);
      }
    },
    [endpoint, setIsLoading]
  );

  useEffect(() => {
    if (isFirstRender.current) {
      fetchData(initialParams);
      isFirstRender.current = false;
    }
  }, [fetchData, initialParams]);

  const updateParams = useCallback(
    (newParams: FetchParams) => {
      setParams(newParams);
      fetchData(newParams);
    },
    [fetchData]
  );

  return { data, totalRecords, totalPages, error, setParams: updateParams };
};

export default useFetchEBookCategoryStats;
