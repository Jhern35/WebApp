import React, { useState } from "react";
import axios from "axios";
import { Routes, Route, useNavigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import ControlPanel from "./ControlPanel";
import "./App.css";

function LoginPage() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    setError("");
    setSuccess("");
    try {
      await axios.post("http://localhost:5000/api/auth/register", { email, password });
      setSuccess("Account created! You can now log in.");
      setMode("login");
    } catch (err) {
      setError(err.response?.data?.msg || "Registration failed");
    }
  };

  const handleLogin = async () => {
    setError("");
    setSuccess("");
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.msg || "Login failed");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1 className="auth-title">Irrigation Monitor</h1>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
          >
            Login
          </button>
          <button
            className={`auth-tab ${mode === "register" ? "active" : ""}`}
            onClick={() => { setMode("register"); setError(""); setSuccess(""); }}
          >
            Register
          </button>
        </div>

        <div className="auth-body">
          {error && <p className="auth-error">{error}</p>}
          {success && <p className="auth-success">{success}</p>}

          <input
            className="auth-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (mode === "login" ? handleLogin() : handleRegister())}
          />

          {mode === "login" ? (
            <button className="auth-btn" onClick={handleLogin}>Login</button>
          ) : (
            <button className="auth-btn" onClick={handleRegister}>Create Account</button>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/system/:esp32Id/control" element={<ControlPanel />} />
    </Routes>
  );
}

export default App;
