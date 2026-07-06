import React, { useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    fetch(`${API_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        return data;
      })
      .then((data) => setMessage(data.message))
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
          <h2 className="text-2xl font-extrabold text-black">Forgot Password?</h2>
          <p className="mt-1 text-sm text-[#5b6362]">
            No worries — drop your email and we'll send a reset link.
          </p>
        </div>
        {error && <p className="m-0 text-center text-sm text-[#d93636]">{error}</p>}
        {message && <p className="m-0 text-center text-sm text-[#1a8f3c]">{message}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-[10px] border-2 border-black px-3.5 py-2.5 text-[15px] outline-none"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-full border-2 border-black bg-[#ffd400] px-6.25 py-2.5 text-[15px] font-bold text-black shadow-[3px_3px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000] active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
        <div className="mt-2 flex justify-center">
          <Link to="/login" className="text-[13px] text-black">
            Back to login
          </Link>
        </div>
      </form>
    </div>
  );
}

export default ForgotPassword;
