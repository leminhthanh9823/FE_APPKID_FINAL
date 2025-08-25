import { useState } from 'react';
import apiClient from '../apis/apiRequest';
import { useLoading } from './useLoading';
import { MESSAGE } from '@/utils/constants/errorMessage';
import { toast } from 'react-toastify';

const usePutItemJson = (endpoint: string) => {
  const [error, setError] = useState<string | null>(null);
  const { setIsLoading } = useLoading();

  const saveChanges = async (reqBody: any): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.put(endpoint, reqBody, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.success) {
        toast.success(response.data.message);
        return true;
      } 
      return true;
    } catch (err: any) {
        setError(err || MESSAGE.SERVER_CONNECTION_ERROR);
        toast.error(err || MESSAGE.SERVER_CONNECTION_ERROR);
        return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { saveChanges, error };
};

export default usePutItemJson;
