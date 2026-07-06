import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleResponse = (response) => {
    setError("");
    fetch(`${API_URL}/api/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential: response.credential }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Google sign-in failed");
        return data;
      })
      .then((data) => {
        login(data.user, data.token);
        navigate("/");
      })
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    const initializeGoogle = () => {
      if (!window.google) return;
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });
      window.google.accounts.id.renderButton(document.getElementById("googleSignUpDiv"), {
        theme: "outline",
        size: "large",
        width: 300,
        text: "signup_with",
      });
    };

    if (window.google) {
      initializeGoogle();
      return;
    }
    const interval = setInterval(() => {
      if (window.google) {
        clearInterval(interval);
        initializeGoogle();
      }
    }, 150);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Registration failed");
        return data;
      })
      .then(() => {
        setSuccess("Account created! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1200);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  return (
    <div className="flex min-h-screen items-center justify-center font-[Poppins,sans-serif]">
      <form
        onSubmit={handleSubmit}
        className="flex w-85 max-w-[90%] flex-col gap-3.5 rounded-2xl border-2 border-black bg-white p-10 shadow-[6px_6px_0_#000]"
      >
        <div className="mb-1 text-center">
          <h2 className="text-2xl font-extrabold text-black">Join the Troop!</h2>
          <p className="mt-1 text-sm text-[#5b6362]">Sign up and start collecting books</p>
        </div>
        {error && <p className="m-0 text-center text-sm text-[#d93636]">{error}</p>}
        {success && <p className="m-0 text-center text-sm text-[#1a8f3c]">{success}</p>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="rounded-[10px] border-2 border-black px-3.5 py-2.5 text-[15px] outline-none"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-[10px] border-2 border-black px-3.5 py-2.5 text-[15px] outline-none"
          required
        />
        <input
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-[10px] border-2 border-black px-3.5 py-2.5 text-[15px] outline-none"
          minLength={6}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-full border-2 border-black bg-[#ffd400] px-6.25 py-2.5 text-[15px] font-bold text-black shadow-[3px_3px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000] active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
        <div className="mt-2 flex justify-center">
          <Link to="/login" className="text-[13px] text-black">
            Already have an account? Login
          </Link>
        </div>
        <div className="my-1 flex items-center gap-2.5">
          <span className="h-px flex-1 bg-[#ddd]" />
          <span className="text-xs text-[#888]">OR</span>
          <span className="h-px flex-1 bg-[#ddd]" />
        </div>
        <div id="googleSignUpDiv" className="flex justify-center" />
      </form>
    </div>
  );
}

export default Register;
