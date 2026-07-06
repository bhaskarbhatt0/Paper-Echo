import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { ratingFor } from "../utils/rating";
import { parsePrice } from "../utils/price";

const QUIZ_QUESTIONS = [
  {
    question: "Pick a mood for tonight:",
    options: [
      { label: "😱 Give me chills", genre: "Horror" },
      { label: "🐉 Magic & adventure", genre: "Fantasy" },
      { label: "💡 Self-improvement", genre: "Self-Help" },
      { label: "📖 An emotional story", genre: "Fiction" },
    ],
  },
  {
    question: "What are you curious about?",
    options: [
      { label: "🎌 Anime & comics", genre: "Manga" },
      { label: "🏛️ Real history", genre: "History" },
      { label: "👤 Real people's lives", genre: "Biography" },
      { label: "♟️ Power & tactics", genre: "Strategy" },
    ],
  },
  {
    question: "What's your goal right now?",
    options: [
      { label: "🚀 Grow my career", genre: "Business" },
      { label: "🧘 Find inner peace", genre: "Self-Help" },
      { label: "🗡️ Epic battles", genre: "Fantasy" },
      { label: "🔦 Something spooky", genre: "Horror" },
    ],
  },
  {
    question: "Pick a vibe:",
    options: [
      { label: "📚 Classic storytelling", genre: "Fiction" },
      { label: "🎨 Visual storytelling", genre: "Manga" },
      { label: "⏳ Learn from the past", genre: "History" },
      { label: "🧑‍💼 Real success stories", genre: "Biography" },
    ],
  },
];

function ChatBot() {
  const [open, setOpen] = useState(false);
  const [books, setBooks] = useState([]);
  const [mode, setMode] = useState(null);
  const [genre, setGenre] = useState(null);
  const [genreSource, setGenreSource] = useState(null);
  const [genreSubMode, setGenreSubMode] = useState(null);
  const [quizIndex, setQuizIndex] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [surprisePick, setSurprisePick] = useState(null);
  const [addedId, setAddedId] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    if (open && books.length === 0) {
      fetch("http://localhost:5000/api/books")
        .then((res) => res.json())
        .then(setBooks)
        .catch(() => setBooks([]));
    }
  }, [open, books.length]);

  const genres = Array.from(new Set(books.map((b) => b.genre || "General")));

  const pickSurprise = () => {
    if (books.length === 0) return;
    setSurprisePick(books[Math.floor(Math.random() * books.length)]);
  };

  const goToMode = (nextMode) => {
    setMode(nextMode);
    setGenre(null);
    setGenreSource(null);
    setGenreSubMode(null);
    setQuizIndex(null);
    setQuizAnswers([]);
    if (nextMode === "surprise") pickSurprise();
  };

  const reset = () => {
    setMode(null);
    setGenre(null);
    setGenreSource(null);
    setGenreSubMode(null);
    setQuizIndex(null);
    setQuizAnswers([]);
    setSurprisePick(null);
  };

  const startQuiz = () => {
    setGenreSubMode("quiz");
    setQuizIndex(0);
    setQuizAnswers([]);
  };

  const answerQuiz = (chosenGenre) => {
    const newAnswers = [...quizAnswers];
    newAnswers[quizIndex] = chosenGenre;
    setQuizAnswers(newAnswers);

    if (quizIndex + 1 < QUIZ_QUESTIONS.length) {
      setQuizIndex(quizIndex + 1);
    } else {
      const counts = {};
      newAnswers.forEach((g) => {
        counts[g] = (counts[g] || 0) + 1;
      });
      const maxScore = Math.max(...Object.values(counts));
      const winners = Object.keys(counts).filter((g) => counts[g] === maxScore);
      const result = winners[Math.floor(Math.random() * winners.length)];
      setGenre(result);
      setGenreSource("quiz");
      setQuizIndex(null);
    }
  };

  const goBack = () => {
    if (mode === "genre") {
      if (genre) {
        setGenre(null);
        setGenreSource(null);
        if (genreSource === "quiz") setGenreSubMode(null);
        return;
      }
      if (quizIndex !== null) {
        if (quizIndex > 0) setQuizIndex(quizIndex - 1);
        else {
          setQuizIndex(null);
          setGenreSubMode(null);
        }
        return;
      }
      if (genreSubMode === "direct") {
        setGenreSubMode(null);
        return;
      }
    }
    reset();
  };

  const handleAddToCart = (book) => {
    addToCart(book);
    setAddedId(book.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  const genreSuggestions = genre ? books.filter((b) => b.genre === genre).slice(0, 3) : [];
  const topRated = [...books]
    .sort((a, b) => ratingFor(b.id) - ratingFor(a.id))
    .slice(0, 3);
  const budgetPicks = [...books]
    .sort((a, b) => parsePrice(a.price) - parsePrice(b.price))
    .slice(0, 3);

  const BookRow = ({ book }) => (
    <div className="flex items-center gap-2.5 rounded-xl border-2 border-black p-2">
      <img src={book.img} alt={book.title} className="h-14 w-10 rounded-md object-cover" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-black">{book.title}</p>
        <p className="text-[11px] text-[#5b6362]">₹{book.price}</p>
      </div>
      <button
        onClick={() => handleAddToCart(book)}
        className="shrink-0 rounded-full border-2 border-black bg-[#38bdf8] px-2.5 py-1 text-[11px] font-bold text-black shadow-[2px_2px_0_#000]"
      >
        {addedId === book.id ? "Added ✓" : "🛒 Add"}
      </button>
    </div>
  );

  const BotBubble = ({ children }) => (
    <div className="max-w-[85%] rounded-2xl rounded-bl-none border-2 border-black bg-[#f2f2f2] px-3 py-2 text-sm text-black">
      {children}
    </div>
  );

  return (
    <div className="fixed right-4 bottom-4 z-200 sm:right-6 sm:bottom-6">
      {open && (
        <div className="mb-3 flex w-72 flex-col overflow-hidden rounded-2xl border-2 border-black bg-white shadow-[6px_6px_0_#000] sm:w-80">
          <div className="flex items-center justify-between border-b-2 border-black bg-[#ffd400] px-4 py-2.5">
            <span className="text-sm font-extrabold text-black">🐣 Mimu</span>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md px-1.5 text-black hover:bg-black/10"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          <div className="flex max-h-96 flex-col gap-3 overflow-y-auto p-4">
            {!mode && (
              <>
                <BotBubble>
                  Hi, I'm Mimu! 🐣 What are you in the mood for?
                </BotBubble>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => goToMode("genre")}
                    className="rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-bold shadow-[2px_2px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#000] active:translate-y-0 active:shadow-none"
                  >
                    📚 Browse by genre
                  </button>
                  <button
                    onClick={() => goToMode("surprise")}
                    className="rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-bold shadow-[2px_2px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#000] active:translate-y-0 active:shadow-none"
                  >
                    🎲 Surprise me
                  </button>
                  <button
                    onClick={() => goToMode("top")}
                    className="rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-bold shadow-[2px_2px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#000] active:translate-y-0 active:shadow-none"
                  >
                    🔥 Top rated
                  </button>
                  <button
                    onClick={() => goToMode("budget")}
                    className="rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-bold shadow-[2px_2px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#000] active:translate-y-0 active:shadow-none"
                  >
                    💰 Budget picks
                  </button>
                </div>
              </>
            )}

            {mode === "genre" && (
              <>
                {!genre && genreSubMode === null && (
                  <>
                    <BotBubble>Want to pick yourself, or should I guess with a quick quiz?</BotBubble>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setGenreSubMode("direct")}
                        className="rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-bold shadow-[2px_2px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#000] active:translate-y-0 active:shadow-none"
                      >
                        🎯 Pick myself
                      </button>
                      <button
                        onClick={startQuiz}
                        className="rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-bold shadow-[2px_2px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#000] active:translate-y-0 active:shadow-none"
                      >
                        🧭 Quick quiz
                      </button>
                    </div>
                  </>
                )}

                {genreSubMode === "direct" && !genre && (
                  <>
                    <BotBubble>Which genre?</BotBubble>
                    <div className="flex flex-wrap gap-2">
                      {genres.length === 0 ? (
                        <span className="text-xs text-[#5b6362]">Loading genres...</span>
                      ) : (
                        genres.map((g) => (
                          <button
                            key={g}
                            onClick={() => {
                              setGenre(g);
                              setGenreSource("direct");
                            }}
                            className="rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-bold shadow-[2px_2px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#000] active:translate-y-0 active:shadow-none"
                          >
                            {g}
                          </button>
                        ))
                      )}
                    </div>
                  </>
                )}

                {quizIndex !== null && (
                  <>
                    <BotBubble>{QUIZ_QUESTIONS[quizIndex].question}</BotBubble>
                    <div className="flex flex-wrap gap-2">
                      {QUIZ_QUESTIONS[quizIndex].options.map((opt) => (
                        <button
                          key={opt.label}
                          onClick={() => answerQuiz(opt.genre)}
                          className="rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-bold shadow-[2px_2px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#000] active:translate-y-0 active:shadow-none"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    <span className="text-[11px] text-[#5b6362]">
                      Question {quizIndex + 1} of {QUIZ_QUESTIONS.length}
                    </span>
                  </>
                )}

                {genre && (
                  <>
                    <BotBubble>
                      {genreSource === "quiz" ? (
                        <>
                          Based on your answers, I think you'd love <strong>{genre}</strong>! Here's
                          what I found:
                        </>
                      ) : (
                        <>
                          Here's what I found for <strong>{genre}</strong>:
                        </>
                      )}
                    </BotBubble>
                    <div className="flex flex-col gap-2.5">
                      {genreSuggestions.length === 0 ? (
                        <span className="text-xs text-[#5b6362]">No books found here yet.</span>
                      ) : (
                        genreSuggestions.map((book) => <BookRow key={book.id} book={book} />)
                      )}
                    </div>
                  </>
                )}
              </>
            )}

            {mode === "surprise" && surprisePick && (
              <>
                <BotBubble>Ta-da! 🎉 How about this one:</BotBubble>
                <BookRow book={surprisePick} />
                <button
                  onClick={pickSurprise}
                  className="self-start rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-bold shadow-[2px_2px_0_#000] hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#000]"
                >
                  🎲 Try another
                </button>
              </>
            )}

            {mode === "top" && (
              <>
                <BotBubble>These are the crowd favorites 🔥</BotBubble>
                <div className="flex flex-col gap-2.5">
                  {topRated.map((book) => (
                    <BookRow key={book.id} book={book} />
                  ))}
                </div>
              </>
            )}

            {mode === "budget" && (
              <>
                <BotBubble>Easy on the wallet, still a good read 💰</BotBubble>
                <div className="flex flex-col gap-2.5">
                  {budgetPicks.map((book) => (
                    <BookRow key={book.id} book={book} />
                  ))}
                </div>
              </>
            )}

            {mode && (
              <div className="flex gap-3">
                <button
                  onClick={goBack}
                  className="self-start text-xs font-semibold text-[#5b6362] underline"
                >
                  ← Back
                </button>
                <button
                  onClick={reset}
                  className="self-start text-xs font-semibold text-[#5b6362] underline"
                >
                  ↺ Start over
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="relative">
        {!open && (
          <span className="absolute inset-0 animate-ping rounded-full bg-white opacity-60" />
        )}
        <button
          onClick={() => setOpen(!open)}
          className="relative flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-black bg-white text-3xl shadow-[5px_5px_0_#000] ring-4 ring-black/10 transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#000] active:translate-y-0 active:shadow-none"
          aria-label="Toggle Mimu chat"
        >
          {open ? "✕" : "🐣"}
        </button>
      </div>
    </div>
  );
}

export default ChatBot;