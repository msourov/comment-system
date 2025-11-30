import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import './Navbar.scss';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          ThreadSphere
        </Link>

        <div className="navbar-menu">
          {isAuthenticated ? (
            <>
              <span className="navbar-user">
                Welcome, {user?.username || 'User'}
              </span>
              <button onClick={handleLogout} className="btn btn-logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-link">
                Login
              </Link>
              <Link to="/register" className="btn btn-outline">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
