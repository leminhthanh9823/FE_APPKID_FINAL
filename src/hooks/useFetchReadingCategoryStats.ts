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

interface ReadingCategoryStats {
  id: number;
  title: string;
  description: string;
  image: string;
  grade_id: number;
  is_active: number;
  created_at: string;
  updated_at: string;
  statistics: {
    total_readings: number;
    total_attempts: number;
    total_passed: number;
    pass_rate: string;
  };
}

interface ApiResponse {
  success: boolean;
  message: string;
  status: number;
  data: {
    records: ReadingCategoryStats[];
    total_record: number;
    total_page: number;
  };
}

const useFetchReadingCategoryStats = (
  endpoint: string,
  initialParams: FetchParams
) => {
  const [data, setData] = useState<ReadingCategoryStats[]>([]);
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

export default useFetchReadingCategoryStats;
