import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../apis/apiRequest';
import { useLoading } from './useLoading';
import { MESSAGE } from '@/utils/constants/errorMessage';

interface FetchParams {
  pageNumb?: number | null;
  pageSize?: number | null;
  searchTerm?: string | null;
}

interface TeacherRecord {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  status: boolean;
  gender: string;
  dob: string;
  image: string | null;
  email_verified_at: string | null;
  created_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: {
    records: T[];
    total_record: number;
    total_page: number;
  };
}

const useFetchTeacher = <T extends TeacherRecord>(
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
      const requestBody = {
        pageNumb: params.pageNumb || 1,
        pageSize: params.pageSize || 10,
        searchTerm: params.searchTerm || '',
      };

      const response: any = await apiClient.post(endpoint, requestBody);

      if (response && response.data && response.data.success) {
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
  }, [endpoint, params, setIsLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, totalRecords, totalPages, setParams };
};

export default useFetchTeacher;
