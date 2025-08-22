import { useState } from 'react';
import apiClient from '../apis/apiRequest';
import { useLoading } from './useLoading';
import {
  MESSAGE,
  formatValidationErrors,
} from '@/utils/constants/errorMessage';
import { toast } from 'react-toastify';

interface ValidationError {
  field: string;
  message: string;
}

interface ApiErrorResponse {
  success: boolean;
  message: string;
  errors?: ValidationError[] | string[];
  status: number;
}

const useEditItem = (endpoint: string, formData: any) => {
  const [error, setError] = useState<string | null>(null);
  const { setIsLoading } = useLoading();

  const saveChanges = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.put(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.data.success) {
        throw new Error(MESSAGE.UPDATE_FAIL);
      }

      return true;
    } catch (err: any) {
      toast.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { formData, saveChanges, error };
};

export default useEditItem;
