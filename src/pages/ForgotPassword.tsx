import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import apiClient from "../apis/apiRequest";
import logo from "../assets/engkid_logo.png";
import "react-toastify/dist/ReactToastify.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiClient.post("/auth/forgot-password", { email });
      if (response.data.success) {
        toast.success("Password reset request sent! Please check your email.");
      } else {
        toast.error(response.data.message || "An error occurred.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Server error.");
    } finally {
      setSubmitting(false);
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

                <div className="card mb-3 w-100">
                  <div className="card-body">
                    <div className="pt-4 pb-2">
                      <h5 className="card-title text-center pb-0 fs-4">Forgot Password</h5>
                      <p className="text-center small">Enter your email to reset your password</p>
                    </div>

                    <form className="row g-3 needs-validation" onSubmit={handleSubmit}>
                      <div className="col-12">
                        <label htmlFor="yourEmail" className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          id="yourEmail"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div className="col-12">
                        <button className="btn btn-primary w-100" type="submit" disabled={submitting}>
                          {submitting ? "Sending..." : "Send Reset Link"}
                        </button>
                      </div>

                      <div className="col-12 text-center">
                        <p className="small mb-0">
                          Remember your password? <a href="/">Login here</a>
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

export default ForgotPassword;
