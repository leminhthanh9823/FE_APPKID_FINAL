import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../apis/apiRequest';
import { useLoading } from './useLoading';
import { MESSAGE } from '@/utils/constants/errorMessage';

interface FetchParams {
  pageNumb?: number | null;
  pageSize?: number | null;
  sorts?: string | null;
  searchTerm?: string | null;
  is_active?: number | null;
  grade_id?: number | null;
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

const useFetchReading = <T>(endpoint: string, initialParams: FetchParams) => {
  const [data, setData] = useState<T[]>([]);
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
        const response = await apiClient.post<ApiResponse<T>>(
          endpoint,
          requestParams
        );
        console.log(response)
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
    [endpoint, setIsLoading]
  );

  // Chỉ gọi API khi component mount lần đầu
  useEffect(() => {
    if (isFirstRender.current) {
      fetchData(initialParams);
      isFirstRender.current = false;
    }
  }, [fetchData, initialParams]);

  // Update params và gọi API khi setParams được gọi
  const updateParams = useCallback(
    (newParams: FetchParams) => {
      setParams(newParams);
      fetchData(newParams);
    },
    [fetchData]
  );

  return { data, totalRecords, totalPages, error, setParams: updateParams };
};

export default useFetchReading;
