import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
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
      window.google.accounts.id.renderButton(document.getElementById("googleSignInDiv"), {
        theme: "outline",
        size: "large",
        width: 300,
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
    setLoading(true);

    fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Login failed");
        return data;
      })
      .then((data) => {
        login(data.user, data.token);
        navigate("/");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center gap-10 overflow-hidden px-5 py-10 font-[Poppins,sans-serif] lg:gap-16">
      <div className="hidden max-w-sm flex-col gap-5 text-white lg:flex">
        <span className="wave-hi self-start text-8xl">🐣</span>
        <h1 className="text-4xl font-extrabold">Welcome back to your shelf</h1>
        <p className="text-white/60">
          Pick up right where you left off — your cart, your genres, your pace.
        </p>
        <ul className="flex flex-col gap-3 text-sm text-white/80">
          <li className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-black bg-[#ffd400] text-xs font-bold text-black">
              ✓
            </span>
            90+ handpicked books across 9 genres
          </li>
          <li className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-black bg-[#38bdf8] text-xs font-bold text-black">
              ✓
            </span>
            Personalized picks from Mimu, your reading buddy
          </li>
          <li className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-black bg-[#ff4d8d] text-xs font-bold text-black">
              ✓
            </span>
            Save favorites to your cart anytime
          </li>
        </ul>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex w-85 max-w-[90%] flex-col gap-3.5 rounded-2xl border-2 border-black bg-white p-10 shadow-[6px_6px_0_#000]"
      >
        <div className="mb-1 text-center">
          <h2 className="text-2xl font-extrabold text-black">Welcome Back!</h2>
          <p className="mt-1 text-sm text-[#5b6362]">Log in to continue exploring books</p>
        </div>
        {error && <p className="m-0 text-center text-sm text-[#d93636]">{error}</p>}
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
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-[10px] border-2 border-black px-3.5 py-2.5 text-[15px] outline-none"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-full border-2 border-black bg-[#ffd400] px-6.25 py-2.5 text-[15px] font-bold text-black shadow-[3px_3px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000] active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <div className="mt-2 flex justify-between">
          <Link to="/forgot-password" className="text-[13px] text-black">
            Forgot password?
          </Link>
          <Link to="/register" className="text-[13px] text-black">
            Create an account
          </Link>
        </div>
        <div className="my-1 flex items-center gap-2.5">
          <span className="h-px flex-1 bg-[#ddd]" />
          <span className="text-xs text-[#888]">OR</span>
          <span className="h-px flex-1 bg-[#ddd]" />
        </div>
        <div id="googleSignInDiv" className="flex justify-center" />
      </form>
    </div>
  );
}

export default Login;