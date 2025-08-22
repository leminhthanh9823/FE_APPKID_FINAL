import { useState } from 'react';
import apiClient from '../apis/apiRequest';
import { useLoading } from './useLoading';
import { MESSAGE } from '@/utils/constants/errorMessage';
import { toast } from 'react-toastify';

interface ValidationError {
  field: string;
  message: string;
}

interface ApiErrorResponse {
  success: boolean;
  message: string;
  errors?: ValidationError[];
  status: number;
}

const useDeleteItem = (endpoint: string) => {
  const [error, setError] = useState<string | null>(null);
  const { setIsLoading } = useLoading();

  const saveChanges = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.delete(endpoint);

      if (!response.data.success) {
        throw new Error(MESSAGE.DELETE_FAIL);
      }

      return true;
    } catch (err: any) {
      // Xử lý lỗi validation từ API
      if (err.response && err.response.status === 400) {
        const errorData: ApiErrorResponse = err.response.data;

        if (errorData.errors && errorData.errors.length > 0) {
          // Hiển thị từng lỗi validation
          errorData.errors.forEach((validationError: ValidationError) => {
            toast.error(`${validationError.field}: ${validationError.message}`);
          });
        } else if (errorData.message) {
          toast.error(errorData.message);
        }

        setError(errorData.message || MESSAGE.DELETE_FAIL);
      } else if (
        err.response &&
        err.response.data &&
        err.response.data.message
      ) {
        // Xử lý các lỗi khác từ API
        toast.error(err.response.data.message);
        setError(err.response.data.message);
      } else {
        // Lỗi kết nối hoặc lỗi không xác định
        toast.error(MESSAGE.SERVER_CONNECTION_ERROR);
        setError(MESSAGE.SERVER_CONNECTION_ERROR);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { saveChanges, error };
};

export default useDeleteItem;
