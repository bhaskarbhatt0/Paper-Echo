import React, { useState } from "react";
import { useCart } from "../context/CartContext";

function CartDrawer({ open, onClose }) {
  const { items, removeFromCart, total } = useCart();
  const [showComingSoon, setShowComingSoon] = useState(false);

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-250 bg-black/30 backdrop-blur-sm transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <div
        className={`fixed top-0 right-0 z-300 flex h-full w-full max-w-sm flex-col border-l-2 border-white/30 bg-white/50 font-[Poppins,sans-serif] text-black shadow-2xl backdrop-blur-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b-2 border-black bg-[#ffd400] px-5 py-4">
          <h2 className="text-lg font-extrabold text-black">Your Cart</h2>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-black hover:bg-black/10"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="mt-10 text-center text-[#5b6362]">Your cart is empty</p>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl border-2 border-black/70 bg-white/40 p-2.5 shadow-[2px_2px_0_rgba(0,0,0,0.5)] backdrop-blur-md"
                >
                  <img
                    src={item.img}
                    alt={item.title}
                    className="h-16 w-12 rounded-md object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-black">{item.title}</p>
                    <p className="text-xs text-[#5b6362]">
                      Qty {item.qty} × ₹{item.price}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="shrink-0 rounded-full border-2 border-black bg-white px-2.5 py-1 text-xs font-bold text-black shadow-[2px_2px_0_#000] transition-all hover:-translate-y-0.5 hover:bg-[#ff4d8d] hover:shadow-[3px_3px_0_#000]"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t-2 border-black/20 bg-white/30 px-5 py-4 backdrop-blur-md">
            <div className="mb-3 flex justify-between text-sm">
              <span className="font-semibold text-[#5b6362]">Total</span>
              <span className="text-lg font-extrabold text-black">₹{total.toFixed(2)}</span>
            </div>
            <button
              onClick={() => setShowComingSoon(true)}
              className="w-full rounded-full border-2 border-black bg-[#ffd400] px-4 py-2.5 text-sm font-bold text-black shadow-[3px_3px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000] active:translate-y-0 active:shadow-none"
            >
              Checkout
            </button>
          </div>
        )}
      </div>

      {showComingSoon && (
        <div className="fixed inset-0 z-400 flex items-center justify-center bg-black/50">
          <div className="mx-4 flex max-w-xs flex-col items-center gap-2 rounded-2xl border-2 border-black bg-white p-6 text-center shadow-[6px_6px_0_#000]">
            <span className="text-4xl">🚧</span>
            <p className="text-base font-extrabold text-black">Checkout Coming Soon!</p>
            <p className="text-sm text-[#5b6362]">
              We're still setting up payments. Hang tight!
            </p>
            <button
              onClick={() => setShowComingSoon(false)}
              className="mt-2 rounded-full border-2 border-black bg-[#ffd400] px-6 py-2 text-sm font-bold text-black shadow-[3px_3px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000]"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default CartDrawer;