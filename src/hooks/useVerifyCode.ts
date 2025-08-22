import { toast } from "react-toastify";
import apiClient from "../apis/apiRequest";
import { useLoading } from "./useLoading";
import { ROUTES } from "../routers/routes";

const useVerifyCode = () => {
  const { setIsLoading } = useLoading();

  const verifyCode = async (loginId: string, verifyCode: string) => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.post("/auth/verify-password", { loginId, verifyCode });
      
      if (data.success) {
        localStorage.setItem("sessionToken", data.data.session_token);
        toast.success("Verification successful!");

        setTimeout(() => {
          window.location.href = ROUTES.RESETPASS;
        }, 1000);
      } else {
        toast.error(data.message);
      }
    } catch (error: any) {
      toast.error(error || "Verification failed!");
    } finally {
      setIsLoading(false);
    }
  };

  return { verifyCode };
};

export default useVerifyCode;
