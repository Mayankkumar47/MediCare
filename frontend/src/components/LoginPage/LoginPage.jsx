import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, LogIn } from 'lucide-react';
import { loginPageStyles, toastStyles } from '../../assets/dummyStyles';
import logo from '../../assets/logo.png';

import API_BASE from '../../api.js';
const STORAGE_KEY = "doctorToken_v1";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/api/doctors/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        toast.error(json?.message || "Login failed", { duration: 4000 });
        setBusy(false);
        return;
      }
      const token = json?.token || json?.data?.token;
      if (!token) {
        toast.error("Authentication token missing");
        setBusy(false);
        return;
      }

      const doctorId =
        json?.data?._id || json?.doctor?._id || json?.data?.doctor?._id;
      if (!doctorId) {
        toast.error("Doctor ID missing from server response");
        setBusy(false);
        return;
      }

      localStorage.setItem(STORAGE_KEY, token);
      window.dispatchEvent(
        new StorageEvent("storage", { key: STORAGE_KEY, newValue: token }),
      );
      toast.success("Login successful — redirecting...", {
        style: toastStyles.successToast,
      });
      setTimeout(() => {
        navigate(`/doctor-admin/${doctorId}`);
      }, 700);
    } catch (err) {
      console.error("login error", err);
      toast.error("Network error during login");
      setBusy(false);
    }
  };

  return (
    <div className={loginPageStyles.mainContainer}>
      {/* Back button */}
      <Link to="/" className={loginPageStyles.backButton}>
        <ArrowLeft className={loginPageStyles.backButtonIcon} />
        <span>Back to Home</span>
      </Link>

      {/* Login Card */}
      <div className={loginPageStyles.loginCard}>
        <div className={loginPageStyles.logoContainer}>
          <img src={logo} alt="Logo" className={loginPageStyles.logo} />
        </div>

        <h2 className={loginPageStyles.title}>Doctor Login</h2>
        <p className={loginPageStyles.subtitle}>
          Access your appointment scheduler & profile management dashboard
        </p>

        <form onSubmit={handleSubmit} className={loginPageStyles.form}>
          <div>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={loginPageStyles.input}
              disabled={busy}
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={loginPageStyles.input}
              disabled={busy}
              required
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className={`${loginPageStyles.submitButton} flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98`}
          >
            <LogIn className="w-5 h-5" />
            {busy ? "Authenticating..." : "Login to Portal"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;