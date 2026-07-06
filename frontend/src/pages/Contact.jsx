import React, { useState } from "react";

function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    fetch("http://localhost:5000/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to send message");
        return data;
      })
      .then((data) => {
        setSuccess(data.message);
        setName("");
        setEmail("");
        setMessage("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  return (
    <div className="box-border flex min-h-[70vh] w-full items-center justify-center px-5 py-10 font-[Poppins,sans-serif]">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-md flex-col gap-3.5 rounded-2xl border-2 border-black bg-white p-8 shadow-[6px_6px_0_#000] sm:p-10"
      >
        <div className="mb-1 text-center">
          <span className="text-4xl">🐵📬</span>
          <h1 className="mt-1 text-2xl font-extrabold text-black">Get in Touch</h1>
          <p className="mt-1 text-sm text-[#5b6362]">
            Got a question, complaint, or just want to say hi? Drop us a line.
          </p>
        </div>

        {error && <p className="m-0 text-center text-sm text-[#d93636]">{error}</p>}
        {success && <p className="m-0 text-center text-sm text-[#1a8f3c]">{success}</p>}

        <input
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-[10px] border-2 border-black px-3.5 py-2.5 text-[15px] outline-none"
          required
        />
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-[10px] border-2 border-black px-3.5 py-2.5 text-[15px] outline-none"
          required
        />
        <textarea
          placeholder="Your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="rounded-[10px] border-2 border-black px-3.5 py-2.5 text-[15px] outline-none"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-full border-2 border-black bg-[#ffd400] px-6.25 py-2.5 text-[15px] font-bold text-black shadow-[3px_3px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000] active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send Message 🚀"}
        </button>
      </form>
    </div>
  );
}

export default Contact;