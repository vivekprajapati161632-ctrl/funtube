import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const { user, isGuest, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-danger sticky-top shadow-sm">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/">
            FunTube
          </Link>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse" id="navMenu">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <NavLink className="nav-link" to="/">
                  Home
                </NavLink>
              </li>
              {isAuthenticated && (
                <>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/upload">
                      Upload
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/history">
                      History
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/profile">
                      Profile
                    </NavLink>
                  </li>
                </>
              )}
            </ul>

            <div className="d-flex align-items-center gap-2 text-white">
              <span className="small">{isGuest ? "Browsing as Guest" : user?.username}</span>
              {(isAuthenticated || isGuest) ? (
                <button className="btn btn-sm btn-light" onClick={handleLogout}>
                  Logout
                </button>
              ) : (
                <Link className="btn btn-sm btn-light" to="/login">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="container py-4">{children}</main>
    </div>
  );
};

export default Layout;
