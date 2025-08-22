import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../apis/apiRequest';
import { useLoading } from './useLoading';
import { MESSAGE } from '@/utils/constants/errorMessage';

interface FetchParams {
  pageNumb?: number | null;
  pageSize?: number | null;
  searchTerm?: string | null;
  grade_id?: number | null;
}

interface StudentReport {
  id: string;
  student_name: string;
  parent_name: string;
  grade_id: number;
  total_reading: number;
  total_passes: number;
  completion_rate?: number;
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

const useFetchStudentReport = <T extends StudentReport>(
  endpoint: string,
  initialParams: FetchParams
) => {
  const [data, setData] = useState<T[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<FetchParams>(initialParams);
  const { setIsLoading } = useLoading();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const query = new URLSearchParams();

      if (params.pageNumb) query.append('pageNumb', params.pageNumb.toString());
      if (params.pageSize) query.append('pageSize', params.pageSize.toString());
      if (params.searchTerm) query.append('searchTerm', params.searchTerm);
      if (params.grade_id !== null && params.grade_id !== undefined)
        query.append('grade_id', params.grade_id.toString());

      const response = await apiClient.get<ApiResponse<T>>(
        `${endpoint}?${query.toString()}`
      );

      if (response.data.success) {
        const records = response.data.data.records.map((item) => ({
          ...item,
          completion_rate: item.total_reading
            ? Math.round((item.total_passes / item.total_reading) * 100)
            : 0,
        }));
        setData(records);
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
  }, [endpoint, params, setIsLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, totalRecords, totalPages, error, setParams, params };
};

export default useFetchStudentReport;
