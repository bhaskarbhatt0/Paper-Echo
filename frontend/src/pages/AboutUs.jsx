import React from "react";

function AboutUs() {
  return (
    <div className="box-border flex min-h-[70vh] w-full items-center justify-center px-5 py-10 font-[Poppins,sans-serif]">
      <div className="w-full max-w-2xl rounded-2xl border-2 border-black bg-white p-8 text-center shadow-[6px_6px_0_#000] sm:p-10">
        <span className="text-5xl">🙉📚</span>
        <h1 className="mt-3 text-3xl font-extrabold text-black sm:text-4xl">
          About Paper Echo
        </h1>
        <p className="mt-4 text-[#5b6362]">
          We're a bunch of book-obsessed monkeys swinging from shelf to shelf,
          hunting down stories worth reading. Paper Echo started as a small
          collection of favorites and grew into a full-blown jungle of
          fiction, self-help, horror, manga, and everything in between.
        </p>
        <p className="mt-3 text-[#5b6362]">
          No boring corporate mission statements here — just good books,
          fair prices, and a search bar that actually works. Grab a cup of
          coffee, pick a genre, and go ape over your next favorite read. 🎉
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <span className="rounded-full border-2 border-black bg-[#ffd400] px-4 py-1.5 text-sm font-bold text-black">
            📖 26+ Books
          </span>
          <span className="rounded-full border-2 border-black bg-[#38bdf8] px-4 py-1.5 text-sm font-bold text-black">
            🎭 9 Genres
          </span>
          <span className="rounded-full border-2 border-black bg-[#ff4d8d] px-4 py-1.5 text-sm font-bold text-black">
            🐒 100% Fun
          </span>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;