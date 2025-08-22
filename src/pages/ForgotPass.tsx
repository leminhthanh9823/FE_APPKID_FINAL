import useForgotPass from '@/hooks/useForgotPass';
import { ROUTES } from '../routers/routes';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/index.css';
import logo from '../assets/engkid_logo-Photoroom.png';
import { toast } from 'react-toastify';

const ForgotPass: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { forgotPass } = useForgotPass();
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputEmail = e.target.value.trim();
    setEmail(inputEmail);

    if (!validateEmail(inputEmail)) {
      setEmailError('Email không hợp lệ! Vui lòng nhập đúng định dạng.');
    } else {
      setEmailError('');
    }
  };

  useEffect(() => {
    localStorage.clear();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) return;

    setIsLoading(true);

    try {
      await forgotPass(email);

      setTimeout(() => {
        navigate(ROUTES.VERIFYCODE, { state: { email } });
      }, 1000);
    } catch (error: any) {
      toast.error(error?.message || 'Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main>
      <div className="container">
        <section className="section register min-vh-100 d-flex flex-column align-items-center justify-content-center py-4">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-4 col-md-6 d-flex flex-column align-items-center justify-content-center">
                <div className="d-flex justify-content-center py-4">
                  <a
                    href="#"
                    className="logoLarge d-flex align-items-center w-auto"
                  >
                    <img src={logo} alt="Logo" />
                  </a>
                </div>

                <div className="card mb-3">
                  <div className="card-body">
                    <div className="pt-4 pb-2">
                      <h5 className="card-title text-center pb-0 fs-4">
                        ĐẶT LẠI MẬT KHẨU
                      </h5>
                      <p className="text-center small">
                        Nhập email của bạn để nhận mã xác thực.
                      </p>
                    </div>

                    <form
                      className="row g-3 needs-validation"
                      onSubmit={handleSubmit}
                    >
                      <div className="col-12">
                        <label htmlFor="yourUsername" className="form-label">
                          Địa chỉ email
                        </label>
                        <div className="input-group has-validation">
                          <input
                            type="email"
                            className={`form-control ${emailError ? 'is-invalid' : ''}`}
                            id="yourUsername"
                            required
                            value={email}
                            onChange={handleEmailChange}
                            disabled={isLoading}
                          />
                          {emailError && (
                            <div className="invalid-feedback">{emailError}</div>
                          )}
                        </div>
                      </div>

                      <div className="col-12">
                        <button
                          className="btn btn-primary w-100"
                          type="submit"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Sending...' : 'Send'}
                        </button>
                      </div>
                      <div className="col-12">
                        <p className="small mb-0">
                          Already have an account? <a href={ROUTES.LOGIN}>Sign In</a>
                        </p>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ForgotPass;
