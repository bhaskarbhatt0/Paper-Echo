import React, { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import CartDrawer from "./CartDrawer";

function Navbar() {
  const { user, logout } = useAuth();
  const { count, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);

  const handleLogout = () => {
    logout();
    clearCart();
    navigate("/");
    setMenuOpen(false);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    const next = new URLSearchParams(searchParams);
    if (value) next.set("q", value);
    else next.delete("q");
    setSearchParams(next, { replace: true });
  };

  const openCart = () => {
    setCartOpen(true);
    setCartBounce(true);
    setTimeout(() => setCartBounce(false), 400);
  };

  const authLinks = user ? (
    <>
      <div className="flex items-center gap-2 rounded-full border-2 border-black bg-white py-1 pl-1 pr-3">
        <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-black bg-[#38bdf8] text-xs font-extrabold text-black">
          {user.username?.charAt(0).toUpperCase()}
        </span>
        <span className="text-sm font-bold text-black">{user.username}</span>
      </div>
      <button
        onClick={handleLogout}
        className="rounded-full border-2 border-black bg-[#ff4d8d] px-3.5 py-1.5 text-sm font-bold text-black shadow-[3px_3px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000] active:translate-y-0 active:shadow-none"
      >
        Logout
      </button>
    </>
  ) : (
    <>
      <Link
        to="/login"
        onClick={() => setMenuOpen(false)}
        className="rounded-full border-2 border-black bg-white px-3.5 py-1.5 text-sm font-bold text-black no-underline shadow-[3px_3px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000] active:translate-y-0 active:shadow-none"
      >
        Login
      </Link>
      <Link
        to="/register"
        onClick={() => setMenuOpen(false)}
        className="rounded-full border-2 border-black bg-[#ffd400] px-3.5 py-1.5 text-sm font-extrabold text-black no-underline shadow-[3px_3px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000] active:translate-y-0 active:shadow-none"
      >
        Join the Fun
      </Link>
    </>
  );

  return (
    <>
      <nav className="sticky top-3 z-100 mx-3 rounded-xl border-[3px] border-black bg-[#0a0a0a] px-5 py-3 font-[Poppins,sans-serif] shadow-[5px_5px_0_#000] md:mx-auto md:max-w-4xl md:px-7">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-1.5 text-lg font-extrabold tracking-wide text-white no-underline"
          >
            Paper Echo
          </Link>

          <div className="flex flex-1 items-center justify-center gap-5">
            <div className="hidden items-center gap-4 lg:flex">
              <Link
                to="/about"
                className="text-sm font-semibold whitespace-nowrap text-white/80 no-underline transition-colors hover:text-white"
              >
                About Us
              </Link>
              <Link
                to="/contact"
                className="text-sm font-semibold whitespace-nowrap text-white/80 no-underline transition-colors hover:text-white"
              >
                Contact
              </Link>
            </div>

            {location.pathname === "/" && (
              <input
                type="text"
                placeholder="Find a book..."
                value={searchParams.get("q") || ""}
                onChange={handleSearchChange}
                className="hidden w-56 rounded-full border-2 border-black bg-white px-4 py-1.5 text-sm font-medium text-black placeholder-black/50 outline-none sm:block"
              />
            )}
          </div>

          <div className="hidden shrink-0 items-center gap-2.5 md:flex">
            <button
              onClick={openCart}
              className={`relative rounded-full border-2 border-black bg-white px-2.5 py-1.5 text-base shadow-[3px_3px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000] active:translate-y-0 active:shadow-none ${
                cartBounce ? "pop-bounce" : ""
              }`}
              aria-label="Open cart"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4.5 w-4.5"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {count > 0 && (
                <span className="absolute -top-2 -right-2 flex h-4.5 min-w-4.5 items-center justify-center rounded-full border-2 border-black bg-[#ff4d8d] px-1 text-[10px] font-extrabold text-black">
                  {count}
                </span>
              )}
            </button>
            {authLinks}
          </div>

          <div className="flex shrink-0 items-center gap-2 md:hidden">
            <button
              onClick={openCart}
              className={`relative rounded-full border-2 border-black bg-white px-2 py-1.5 text-base shadow-[3px_3px_0_#000] ${
                cartBounce ? "pop-bounce" : ""
              }`}
              aria-label="Open cart"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4.5 w-4.5"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {count > 0 && (
                <span className="absolute -top-2 -right-2 flex h-4.5 min-w-4.5 items-center justify-center rounded-full border-2 border-black bg-[#ff4d8d] px-1 text-[10px] font-extrabold text-black">
                  {count}
                </span>
              )}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-full border-2 border-black bg-white px-2 py-1.5 text-base shadow-[3px_3px_0_#000]"
              aria-label="Toggle menu"
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {location.pathname === "/" && (
          <input
            type="text"
            placeholder="Find a book..."
            value={searchParams.get("q") || ""}
            onChange={handleSearchChange}
            className="mt-1.5 block w-full rounded-full border-2 border-black bg-white px-3 py-1 text-sm font-medium text-black placeholder-black/50 outline-none sm:hidden"
          />
        )}

        {menuOpen && (
          <div className="mt-1.5 flex flex-col gap-2 border-t border-white/25 pt-2 md:hidden">
            <Link
              to="/about"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-semibold text-white/80 no-underline hover:text-white"
            >
              About Us
            </Link>
            <Link
              to="/contact"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-semibold text-white/80 no-underline hover:text-white"
            >
              Contact
            </Link>
            {authLinks}
          </div>
        )}
      </nav>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

export default Navbar;