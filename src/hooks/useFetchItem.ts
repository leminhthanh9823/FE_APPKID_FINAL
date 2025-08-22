import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../apis/apiRequest';
import { useLoading } from './useLoading';
import { MESSAGE } from '@/utils/constants/errorMessage';

interface ApiResponse<T> {
  success: boolean;
  data: any;
  status: number;
}

const useFetchItem = <T>(endpoint: string, initialReq: T) => {
  const [data, setData] = useState<any>();
  const { setIsLoading } = useLoading();
  const [error, setError] = useState<string | null>(null);
  const [req, setReq] = useState<T>(initialReq);

  const fetchData = useCallback(async () => {
    // Check if the request has required data (e.g., id field)
    if (req && typeof req === 'object' && 'id' in req) {
      const idValue = (req as any).id;
      if (
        !idValue ||
        idValue === '' ||
        idValue === null ||
        idValue === undefined
      ) {
        // Don't make request if id is missing/empty
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<ApiResponse<T>>(endpoint, req);
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (err: any) {
      toast.error(err || MESSAGE.SERVER_CONNECTION_ERROR);
      setError(err || MESSAGE.SERVER_CONNECTION_ERROR);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, req, setIsLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, setReq };
};

export default useFetchItem;
