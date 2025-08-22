import { ROUTES } from '../routers/routes';
import '../styles/index.css';
import { useState, useEffect } from 'react';
import logo from '../assets/engkid_logo-Photoroom.png';
import useForgotPass from '@/hooks/useForgotPass';
import useVerifyCode from '@/hooks/useVerifyCode';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ConfirmVerifyCode: React.FC = () => {
  const [code, setCode] = useState<string>('');
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const { verifyCode } = useVerifyCode();
  const { forgotPass } = useForgotPass();

  const email = localStorage.getItem('resetPassEmail');

  useEffect(() => {
    if (!email) {
      window.location.href = ROUTES.LOGIN;
    }
  }, [email]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await verifyCode(email ?? '', code);
    } catch (error: any) {
      toast.error(error?.message || 'Xác thực thất bại!');
    }
  };

  const handleResend = async () => {
    if (!email) return;
    try {
      await forgotPass(email);
      toast.success('Mã xác thực mới đã được gửi!');
      setTimer(30);
      setCanResend(false);
    } catch (error: any) {
      toast.error(error?.message || 'Không thể gửi lại mã!');
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
                        XÁC MINH MÃ XÁC THỰC
                      </h5>
                      <p className="text-center small">
                        Mã xác thực đã được gửi đến email{' '}
                        <strong>{email}</strong>
                      </p>
                    </div>

                    <form
                      className="row g-3 needs-validation"
                      onSubmit={handleSubmit}
                    >
                      <div className="col-12">
                        <label htmlFor="code" className="form-label">
                          Mã Xác Thực
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="code"
                          required
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                        />
                      </div>

                      <div className="col-12">
                        <button className="btn btn-primary w-100" type="submit">
                          Gửi
                        </button>
                      </div>

                      <div className="col-12 text-center">
                        <button
                          className="btn btn-link"
                          type="button"
                          onClick={handleResend}
                          disabled={!canResend}
                        >
                          {canResend ? 'Gửi lại mã' : `Gửi lại sau ${timer}s`}
                        </button>
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

export default ConfirmVerifyCode;
