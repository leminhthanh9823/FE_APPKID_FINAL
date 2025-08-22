import { useState, useEffect } from "react";
import apiClient from "../apis/apiRequest";
import { useLoading } from "./useLoading";
import { MESSAGE } from "@/utils/constants/errorMessage";
import { toast } from "react-toastify";
import { an } from "vitest/dist/chunks/reporters.DAfKSDh5";

interface ApiResponse<T> {
  success: boolean;
  data: {
    records: T[];
    total_record: number;
    total_page: number;
  };
  status: number;
}

const useGetList = <T,>(endpoint: string) => {
  const [data, setData] = useState<T[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const {setIsLoading} = useLoading();
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<ApiResponse<T>>(endpoint);
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
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, totalRecords, totalPages, error };
};

export default useGetList;
