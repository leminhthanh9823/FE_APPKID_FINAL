import logo from '../../assets/engkid_logo-Photoroom.png';
import useLogout from '../../hooks/useLogout';
import '../../styles/index.css';
import user from '../../assets/user_default.png';
import { ROUTES } from '../../routers/routes';
import { useState } from 'react';
import apiClient from '@/apis/apiRequest';
import { toast } from 'react-toastify';
import { useLoading } from '@/hooks/useLoading';
interface HeaderProps {
  onToggleSidebar: () => void;
}
const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {

  const { setIsLoading } = useLoading();
  const { logout } = useLogout();
  const handleLogout = () => {
    logout();
  };
  const userName = localStorage.getItem('displayName');
  const roleName = localStorage.getItem('roleName');
  const email = localStorage.getItem('email');

  const handSendRequestResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
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
      setIsLoading(false);
    }
  }
  return (
    <header id="header" className="header fixed-top d-flex align-items-center">
      <div className="d-flex align-items-center justify-content-between">
        <a
          href={ROUTES.DASHBOARD}
          className="logo d-flex align-items-center justify-content-center"
        >
          <img src={logo} alt="" style={{ objectFit: 'contain' }} />
          <span className="d-none d-lg-block">CMS</span>
        </a>
        <i
          className="bi bi-list toggle-sidebar-btn"
          onClick={onToggleSidebar}
        ></i>
      </div>

      <nav className="header-nav ms-auto">
        <ul className="d-flex align-items-center">
          <li className="nav-item dropdown pe-3">
            <a
              className="nav-link nav-profile d-flex align-items-center pe-0"
              href="#"
              data-bs-toggle="dropdown"
            >
              <img src={user} alt="Profile" className="rounded-circle" />
              <span className="d-none d-md-block dropdown-toggle ps-2">
                {userName != 'null' ? userName : email}
              </span>
            </a>

            <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow profile">
              <li className="dropdown-header">
                <h6>{userName != 'null' ? userName : email}</h6>
                <span>{roleName}</span>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>

              <li>
                <a
                  className="dropdown-item d-flex align-items-center"
                  href={ROUTES.PROFILE}
                >
                  <i className="bi bi-person"></i>
                  <span>Profile</span>
                </a>
              </li>

              <li>
                <a
                  className="dropdown-item d-flex align-items-center"
                  onClick={handSendRequestResetPassword}
                >
                  <i className="bi bi-unlock "></i>
                  <span>Change password</span>
                </a>
              </li>

              <li onClick={handleLogout}>
                <a className="dropdown-item d-flex align-items-center" href="#">
                  <i className="bi bi-box-arrow-right"></i>
                  <span>Logout</span>
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </header>
  );
};
export default Header;
