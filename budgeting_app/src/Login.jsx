import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./login_signup.css";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:8080/api/accounts/login",
        { username, password },
        { withCredentials: true }
      );

      if (response.status === 201) {
        localStorage.setItem("access_token", response.data.access_token);
        navigate("/home");
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || "Login failed");
      } else {
        setError("Server unreachable");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1 className="login-title">Login</h1>

        {error && <p className="login-error">{error}</p>}

        <div className="login-field">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="login-field">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="login-links">
          Not registered? <a href="/signup">Sign up</a> <br />
          <a href="/forgot-password">Forgot password?</a>
        </p>
      </form>
    </div>
  );
}
