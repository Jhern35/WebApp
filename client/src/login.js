import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const register = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        email,
        password
      });
      alert("Registered!");
    } catch (err) {
      alert(err.response?.data?.msg || "Register failed");
    }
  };

  const login = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      localStorage.setItem("token", res.data.token);

      navigate("/dashboard");

    } catch (err) {
      alert(err.response?.data?.msg || "Login failed");
    }
  };

  return (
    <div style={{ padding: "50px" }}>
      <h2>Login System</h2>

      <input
        placeholder="Email"
        onChange={e => setEmail(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Password"
        onChange={e => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={register}>Register</button>
      <button onClick={login}>Login</button>
    </div>
  );
}

export default Login;