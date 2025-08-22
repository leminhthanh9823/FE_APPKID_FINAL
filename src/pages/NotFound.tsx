import { Link } from "react-router-dom";
import "../styles/styleNotfound.css";
import { ROUTES } from "../routers/routes";

const NotFound: React.FC = () => {
  return (
    <div className="error-container">
      <h1 className="error-title">404</h1>
      <p className="error-text">The page you are looking for does not exist.</p>
      <Link to={ROUTES.DASHBOARD} className="error-btn">Back to Dashboard</Link>
    </div>
  );
};

export default NotFound;
