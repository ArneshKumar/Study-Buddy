import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithGoogle,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  auth,
} from "../firebase";
import "./Login.css";

const Login = () => {
  useEffect(() => {
    document.body.style.overflowX = "hidden";
    return () => {
      document.body.style.overflowX = "auto";
    };
  });
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const goBackHome = () => {
    navigate("/");
  };

  const handleGoogleLogin = async () => {
    const user = await signInWithGoogle();
    if (user) {
        navigate("/", { state: { email: user.email, loginbutton: true }});
    }
  };
  
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/", { state: { email: email, loginbutton: true }});
    } catch (err: any) {
      setError("Login failed: " + err.message);
    }
  };

  const handleSignUp = async () => {
    setError("");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/", { state: { email: email, loginbutton: true }});
    } catch (err: any) {
      setError("Sign up failed: " + err.message);
    }
  };

  return (
    <div className="login-page">
      <button className="navigate-study" onClick={goBackHome}>
        Back to Home
      </button>
      <div className="login-card">
        <h1 className="login-title">Study Buddy</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleEmailLogin} className="login-form">
          <input
            type="email"
            placeholder="Email"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="button-group">
            <button type="submit" className="btn btn-login">
              Login
            </button>
            <button
              type="button"
              onClick={handleSignUp}
              className="btn btn-signup"
            >
              Sign Up
            </button>
          </div>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <button onClick={handleGoogleLogin} className="btn-google">
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
