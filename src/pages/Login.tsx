import { useState, useEffect } from "react";
import { ROUTES } from "../routers/routes";
import useLogin from "../hooks/useLogin";
import { toast, ToastContainer } from "react-toastify";
import Cookies from "js-cookie";
import '../styles/index.css';
import logo from '../assets/engkid_logo.png';

const Login: React.FC = () => {
  const { login } = useLogin();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    localStorage.clear();

    const savedUsername = Cookies.get("savedUsername");
    const savedPassword = Cookies.get("savedPassword");
    const savedRememberMe = Cookies.get("rememberMe");

    if (savedUsername && savedPassword && savedRememberMe === "true") {
      setLoginId(savedUsername);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const username = e.target.value;
    setLoginId(username);

    // // if (!validateUsername(username)) {
    // //   setUsernameError("Username không hợp lệ!");
    // // } else {
    // //   setUsernameError("");
    // // }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rememberMe) {
      Cookies.set("savedUsername", loginId, { expires: 7 });
      Cookies.set("savedPassword", password, { expires: 7 });
      Cookies.set("rememberMe", "true", { expires: 7 });
    } else {
      Cookies.remove("savedUsername");
      Cookies.remove("savedPassword");
      Cookies.remove("rememberMe");
    }

    try {
      const result = await login(loginId, password);
      if (result?.success) {
        toast.success("Login Success!");
        setTimeout(() => {
          window.location.href = ROUTES.DASHBOARD;
        }, 1500);
      } else {
        toast.error(result?.errors?.[0] || result?.message || "Login failed");
      }
    } catch (err: any) {
      toast.error(err?.message || "Server connection error");
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
                  <a href="#" className="logoLarge d-flex align-items-center w-auto">
                    <img src={logo} alt="Logo" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
                  </a>
                </div>

                <div className="card mb-3">
                  <div className="card-body">
                    <div className="pt-4 pb-2">
                      <h5 className="card-title text-center pb-0 fs-4">LOGIN</h5>
                      <p className="text-center small">Enter Your Account</p>
                    </div>

                    <form className="row g-3 needs-validation" onSubmit={handleSubmit}>
                      <div className="col-12">
                        <label htmlFor="yourUsername" className="form-label">Username</label>
                        <input 
                          type="text"
                          className={`form-control ${usernameError ? "is-invalid" : ""}`} 
                          id="yourUsername"
                          value={loginId}
                          onChange={handleUsernameChange}
                          required
                        />
                        {usernameError && <div className="invalid-feedback">{usernameError}</div>}
                      </div>
                      <div className="col-12">
                        <label htmlFor="yourPassword" className="form-label">Password</label>
                        <input
                          type="password"
                          className="form-control"
                          id="yourPassword"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>

                      <div className="col-12">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                          />
                          <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
                        </div>
                      </div>

                      <div className="col-12">
                        <button className="btn btn-primary w-100" type="submit">
                          Login
                        </button>
                      </div>
                      <div className="col-12">
                        <p className="small mb-0">
                          Forgot password? <a href={ROUTES.FORGOTPASS}>Reset password</a>
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
      <ToastContainer />
    </main>
  );
};

export default Login;
