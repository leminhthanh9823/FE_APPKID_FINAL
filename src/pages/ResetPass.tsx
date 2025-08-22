import { ROUTES } from '../routers/routes';
import '../styles/index.css';
import { useState, useEffect } from 'react';
import logo from '../assets/engkid_logo-Photoroom.png';
import useLogout from '@/hooks/useLogout';
import { toast } from 'react-toastify';
import useResetPassword from '@/hooks/useResetPassword';
import { useSearchParams } from 'react-router-dom';

const ResetPassword: React.FC = () => {

  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const { resetPassword } = useResetPassword();
  const { logout } = useLogout();

  const email = localStorage.getItem('resetPassEmail');
  const sessionToken = localStorage.getItem('sessionToken');

  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get('token');

  useEffect(() => {
    if (!resetToken) {
      toast.error('Token is invalid or has expired!');
      window.location.href = ROUTES.LOGIN;
    }
  }, [resetToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      setError('Confirm password does not match!');
      return;
    }

    setError('');

    try {
      await resetPassword(newPassword, resetToken);
    } catch (error: any) {
      toast.error(error?.message || 'Change password failed!');
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
                        RESET PASSWORD
                      </h5>
                      <p className="text-center small text-muted">
                        You are resetting the password for the account{' '}
                        <strong>{email}</strong>
                      </p>
                    </div>

                    <form
                      className="row g-3 needs-validation"
                      onSubmit={handleSubmit}
                    >
                      <div className="col-12">
                        <label htmlFor="newPassword" className="form-label">
                          New Password
                        </label>
                        <input
                          type="password"
                          className={`form-control ${error ? 'is-invalid' : ''}`}
                          id="newPassword"
                          required
                          value={newPassword}
                          placeholder="New Password"
                          autoComplete="new-password"
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>

                      <div className="col-12">
                        <label
                          htmlFor="confirmNewPassword"
                          className="form-label"
                        >
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          className={`form-control ${error ? 'is-invalid' : ''}`}
                          id="confirmNewPassword"
                          required
                          placeholder="Confirm New Password"
                          autoComplete="new-password"
                          value={confirmNewPassword}
                          onChange={(e) =>
                            setConfirmNewPassword(e.target.value)
                          }
                        />
                        {error && (
                          <div className="invalid-feedback">{error}</div>
                        )}
                      </div>

                      <div className="col-12">
                        <button className="btn btn-primary w-100" type="submit">
                          Submit
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

export default ResetPassword;
