import { useState, useEffect, useCallback } from "react";
import apiClient from "../../apis/apiRequest";
import { useLoading } from "../useLoading";
import { MESSAGE } from "@/utils/constants/errorMessage";
import { IGetEditNotificationResponse } from "@/diagram/response/notification/getEditNotification.response";
import { VIETNAM_TIMEZONE_OFFSET_HOURS } from "@/utils/constants/constants";
import { toast } from "react-toastify";

interface ApiResponse<T> {
  success: boolean;
  data: any;
  status: number;
}

interface IUseFetchDetailNotificationResult {
  data: IGetEditNotificationResponse | null;
  setData: React.Dispatch<React.SetStateAction<IGetEditNotificationResponse | null>>;
  minDateTime: string;
  setMinDateTime: React.Dispatch<React.SetStateAction<string>>;
  error: string | null;
  setReq: React.Dispatch<React.SetStateAction<any>>;
}

const useFetchDetailNotification = <T,>(endpoint: string, initialReq: T): IUseFetchDetailNotificationResult => {
  const [data, setData] = useState<IGetEditNotificationResponse | null>(null);
  const { setIsLoading } = useLoading();
  const [error, setError] = useState<string | null>(null);
  const [req, setReq] = useState<T>(initialReq);
  const [minDateTime, setMinDateTime] = useState('');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<ApiResponse<T>>(endpoint, req);
      if (response.data.success) {
        let type_target = indentifyTargetReceiver(response.data.data);
        setData(mappingData(response.data.data, type_target));
      } 
    } catch (err: any) {
      toast.error(err || MESSAGE.SERVER_CONNECTION_ERROR);
      setError(err || MESSAGE.SERVER_CONNECTION_ERROR);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, req, setIsLoading]);

  useEffect(() => {
    const now = new Date();
    const utcNow = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    const vietnamNow = new Date(utcNow + (VIETNAM_TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000));
    
    setMinDateTime(vietnamNow.toISOString().slice(0, 16));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const indentifyTargetReceiver = (data: any) : number => {
    if(data && Array.isArray(data.notify_target)){
      if(data.notify_target[0].is_to_all_parents == 1){
        return 0;
      }
      else if (data.notify_target[0].grade_id != null){
        return 1;
      }
      else if(data.notify_target[0].student_id != null){
        return 2;
      }
    }
    return 0;
  };

  const mappingData = (data: any, type_target: number) : IGetEditNotificationResponse => {
    return {
      id: data.id,
      title: data.title,
      content: data.content,
      type_target: type_target,
      send_date: data.send_date,
      is_active: data.is_active,
      grades: type_target == 1 ? data.notify_target && Array.isArray(data.notify_target) && data.notify_target.map((item: any) => item.grade_id) || [] : [],
      students: type_target == 2 ? data.notify_target && Array.isArray(data.notify_target) && data.notify_target.map((item: any) => item.student_id) || [] : []
    };
  };

  return { data, setData, minDateTime, setMinDateTime, error, setReq };
};

export default useFetchDetailNotification;
