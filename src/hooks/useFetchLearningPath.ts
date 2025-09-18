import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../apis/apiRequest';
import { useLoading } from './useLoading';
import { MESSAGE } from '@/utils/constants/errorMessage';

interface FetchParams {
  pageNumb?: number | null;
  pageSize?: number | null;
  searchTerm?: string | null;
  difficulty_level?: number | null;
  is_active: number | null;
}

interface ApiResponse<T> {
  success: boolean;
  data: {
    records: T[];
    total_record: number;
    total_page: number;
  };
  status: number;
}

const useFetchLearningPath = <T>(endpoint: string, initialParams: FetchParams) => {
  const [data, setData] = useState<T[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { setIsLoading } = useLoading();
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<FetchParams>(initialParams);

  const fetchData = useCallback(
    async () => {
      console.log(params)
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.post<ApiResponse<T>>(
          endpoint,
          params
        );
        if (response.data.success) {
          setData(response.data.data.records);
          setTotalRecords(response.data.data.total_record);
          setTotalPages(response.data.data.total_page);
        }
      } catch (err: any) {
        const errorMsg = err || MESSAGE.SERVER_CONNECTION_ERROR;
        toast.error(errorMsg);
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    },
    [endpoint, params, setIsLoading]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, totalRecords, totalPages, error, setParams };
};

export default useFetchLearningPath;
