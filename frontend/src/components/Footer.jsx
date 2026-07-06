import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="mx-3 mt-auto mb-3 rounded-2xl border-2 border-black bg-white/10 px-6 py-8 font-[Poppins,sans-serif] text-white/80 shadow-[4px_4px_0_#000] backdrop-blur-xl md:mx-8 md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row sm:items-start">
        <div className="text-center sm:text-left">
          <p className="flex items-center justify-center gap-2 text-lg font-extrabold text-white sm:justify-start">
            <span>🙉📚</span> Paper Echo
          </p>
          <p className="mt-1 text-sm text-white/70">
            Handpicked stories, worth going ape for 🎉
          </p>
        </div>

        <div className="flex gap-8 text-sm">
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-white">Quick Links</span>
            <Link to="/" className="text-white/70 no-underline hover:text-white">
              Home
            </Link>
            <Link to="/about" className="text-white/70 no-underline hover:text-white">
              About Us
            </Link>
            <Link to="/contact" className="text-white/70 no-underline hover:text-white">
              Contact
            </Link>
            <Link to="/login" className="text-white/70 no-underline hover:text-white">
              Login
            </Link>
            <Link to="/register" className="text-white/70 no-underline hover:text-white">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;