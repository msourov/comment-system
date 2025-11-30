import { Link, useNavigate } from 'react-router-dom';
import './NotFoundPage.scss';

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <div className="error-code">404</div>
        
        <div className="error-content">
          <h1 className="error-title">Page Not Found</h1>
          <p className="error-description">
            Oops! The page you're looking for doesn't exist. It might have been 
            moved or deleted, or perhaps you mistyped the URL.
          </p>

          <div className="error-actions">
            <Link to="/" className="btn btn-primary">
              <span className="btn-icon">🏠</span>
              Go to Homepage
            </Link>
            <button onClick={handleGoBack} className="btn btn-secondary">
              <span className="btn-icon">←</span>
              Go Back
            </button>
          </div>

          <div className="helpful-links">
            <h3>Helpful Links</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </ul>
          </div>
        </div>

        <div className="illustration">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="80" fill="#f3f4f6" />
            <text 
              x="100" 
              y="115" 
              fontSize="60" 
              textAnchor="middle" 
              fill="#6b7280"
            >
              🔍
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
