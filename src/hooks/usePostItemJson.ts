import { useState } from 'react';
import apiClient from '../apis/apiRequest';
import { useLoading } from './useLoading';
import { MESSAGE } from '@/utils/constants/errorMessage';
import { toast } from 'react-toastify';

const usePostItemJson = (endpoint: string) => {
  const [error, setError] = useState<string | null>(null);
  const { setIsLoading } = useLoading();

  const saveChanges = async (reqBody: any): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post(endpoint, reqBody, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.data.success) throw new Error(MESSAGE.UPDATE_FAIL);
      return true;
    } catch (err: any) {
        toast.error(err || MESSAGE.SERVER_CONNECTION_ERROR);
        setError(err || MESSAGE.SERVER_CONNECTION_ERROR);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { saveChanges, error };
};

export default usePostItemJson;
