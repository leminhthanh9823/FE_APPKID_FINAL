import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../apis/apiRequest';
import { useLoading } from './useLoading';
import { MESSAGE } from '@/utils/constants/errorMessage';

interface ReqBodyFetch {
  pageNumb?: number | null;
  pageSize?: number | null;
  sorts?: string | null;
  searchTerm?: string | null;
  is_active?: boolean | null;
  readingId: number | null;
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

const useFetchQuestion = <T>(
  endpoint: string,
  initialReqBody: ReqBodyFetch
) => {
  const [data, setData] = useState<T[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { setIsLoading } = useLoading();
  const [error, setError] = useState<string | null>(null);
  const [reqBody, setReqBody] = useState<ReqBodyFetch>(initialReqBody);
  const isFirstRender = useRef(true);

  const fetchData = useCallback(
    async (requestBody: ReqBodyFetch) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.post<ApiResponse<T>>(
          endpoint,
          requestBody
        );
        if (response.data.success) {
          setData(response.data.data.records);
          setTotalRecords(response.data.data.total_record);
          setTotalPages(response.data.data.total_page);
        } else {
          setError(MESSAGE.DATA_LOAD_FAIL);
        }
      } catch (err: any) {
        toast.error(err || MESSAGE.SERVER_CONNECTION_ERROR);
        setError(MESSAGE.SERVER_CONNECTION_ERROR);
      } finally {
        setIsLoading(false);
      }
    },
    [endpoint, setIsLoading]
  );

  // Chỉ gọi API khi component mount lần đầu
  useEffect(() => {
    if (isFirstRender.current) {
      fetchData(initialReqBody);
      isFirstRender.current = false;
    }
  }, [fetchData, initialReqBody]);

  // Update params và gọi API khi setReqBody được gọi
  const updateReqBody = useCallback(
    (newReqBody: ReqBodyFetch) => {
      setReqBody(newReqBody);
      fetchData(newReqBody);
    },
    [fetchData]
  );

  return { data, totalRecords, totalPages, error, setReqBody: updateReqBody };
};

export default useFetchQuestion;
