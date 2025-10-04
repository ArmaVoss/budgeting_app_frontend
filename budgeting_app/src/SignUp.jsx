import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./login_signup.css"; 

export default function Signup() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/accounts/signup",
        { username, password },
        { withCredentials: true }
      );

      if (response.status === 201) {
        // Store token (optional if you use only cookies for refresh)
        localStorage.setItem("access_token", response.data.access_token);

        // Redirect to home page
        navigate("/home");
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || "Signup failed");
      } else {
        setError("Server not reachable");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1 className="login-title">Sign Up</h1>

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

        <div className="login-field">
          <label>Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        <p className="login-links">
          Already have an account? <a href="/login">Log in</a>
        </p>
      </form>
    </div>
  );
}
