import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      const { data } = await api.post("/auth/register", form);
      login(data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            <h3 className="mb-3">Create account</h3>
            {error && <div className="alert alert-danger py-2">{error}</div>}

            <form onSubmit={onSubmit} className="d-grid gap-3">
              <input className="form-control" name="username" placeholder="Username" onChange={onChange} required />
              <input className="form-control" name="email" type="email" placeholder="Email" onChange={onChange} required />
              <input className="form-control" name="password" type="password" placeholder="Password" onChange={onChange} required />
              <button className="btn btn-danger" disabled={loading}>
                {loading ? "Creating..." : "Register"}
              </button>
            </form>

            <p className="mt-3 mb-0 text-muted small">
              Already registered? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
