import { Link } from "react-router-dom";
import "../styles/styleForbidden.css";
import { ROUTES } from "../routers/routes";

const Forbidden: React.FC = () => {
  return (
    <div className="error-container">
      <h1 className="error-title">403</h1>
      <p className="error-text">You do not have permission to access this page.</p>
      <Link to={ROUTES.DASHBOARD} className="error-btn">Back to Dashboard</Link>
    </div>
  );
};

export default Forbidden;
