import { toast } from "react-toastify";
import apiClient from "../apis/apiRequest";
import { useLoading } from "./useLoading";

const useForgotPass = () => {
  const { setIsLoading } = useLoading();
  const forgotPass = async (loginId: string) => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.post("/auth/forgot-password", { loginId });
      if (data.success) {
        toast.success('The verification code has been sent to your email');
        localStorage.setItem("resetPassEmail", loginId);
      } 
    } catch (error: any) {
      toast.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  return { forgotPass};
};

export default useForgotPass;
