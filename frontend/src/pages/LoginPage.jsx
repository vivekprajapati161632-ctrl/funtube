import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, skipLogin } = useAuth();
  const [form, setForm] = useState({ loginId: "Admin", password: "1234" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/";

  const onChange = (event) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", form);
      login(data);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const onSkip = () => {
    skipLogin();
    navigate("/");
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            <h3 className="mb-3">Sign in to FunTube</h3>
            <p className="text-muted small">
              Default test account: <strong>Admin / 1234</strong>
            </p>

            {error && <div className="alert alert-danger py-2">{error}</div>}

            <form onSubmit={onSubmit} className="d-grid gap-3">
              <input
                className="form-control"
                name="loginId"
                placeholder="Username or Email"
                value={form.loginId}
                onChange={onChange}
                required
              />
              <input
                className="form-control"
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={onChange}
                required
              />
              <button className="btn btn-danger" disabled={loading}>
                {loading ? "Signing in..." : "Login"}
              </button>
            </form>

            <button className="btn btn-outline-secondary w-100 mt-3" onClick={onSkip}>
              Skip Login
            </button>

            <p className="mt-3 mb-0 text-muted small">
              No account? <Link to="/register">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
