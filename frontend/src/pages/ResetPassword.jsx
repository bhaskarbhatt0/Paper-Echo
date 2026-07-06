import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to reset password");
        return data;
      })
      .then(() => {
        setSuccess("Password reset! Redirecting to login...");
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
          <h2 className="text-2xl font-extrabold text-black">New Password Time!</h2>
          <p className="mt-1 text-sm text-[#5b6362]">Pick something you won't forget again</p>
        </div>
        {error && <p className="m-0 text-center text-sm text-[#d93636]">{error}</p>}
        {success && <p className="m-0 text-center text-sm text-[#1a8f3c]">{success}</p>}
        <input
          type="password"
          placeholder="New password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-[10px] border-2 border-black px-3.5 py-2.5 text-[15px] outline-none"
          minLength={6}
          required
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="rounded-[10px] border-2 border-black px-3.5 py-2.5 text-[15px] outline-none"
          minLength={6}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-full border-2 border-black bg-[#ffd400] px-6.25 py-2.5 text-[15px] font-bold text-black shadow-[3px_3px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000] active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Resetting..." : "Reset Password"}
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

export default ResetPassword;
