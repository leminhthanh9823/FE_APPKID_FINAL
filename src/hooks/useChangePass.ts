import { toast } from "react-toastify";
import apiClient from "../apis/apiRequest";
import { useLoading } from "./useLoading";
import { MESSAGE } from "@/utils/constants/errorMessage";

const useChangePass = () => {
  const { setIsLoading } = useLoading();
  const changePass = async (currentPassword: string, passwordNew: string) => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.post("/user/change-password", { currentPassword, passwordNew });
      if (data.success) {
        toast.success(MESSAGE.CHANGE_PASS_SUCCESS);
      } 
    } catch (error: any) {
      toast.error(error || MESSAGE.SERVER_CONNECTION_ERROR);
    } finally {
      setIsLoading(false);
    }
  };
  return { changePass };
};

export default useChangePass;
