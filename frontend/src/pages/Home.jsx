import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { ratingFor } from "../utils/rating";

const HERO_QUOTES = [
  "A room without books is like a body without a soul.",
  "Today a reader, tomorrow a leader.",
  "Books are a uniquely portable magic.",
  "Reading gives us someplace to go when we have to stay where we are.",
];

const GENRE_OPTIONS = [
  "General",
  "Fiction",
  "Self-Help",
  "Horror",
  "Fantasy",
  "Manga",
  "Strategy",
  "History",
  "Business",
  "Biography",
];

function Home() {
  const { user, logout } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const search = searchParams.get("q") || "";
  const [books, setBooks] = useState([]);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [quoteVisible, setQuoteVisible] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [scrolledPastGate, setScrolledPastGate] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [genresOpen, setGenresOpen] = useState(false);
  const [exploreMode, setExploreMode] = useState(false);
  const [exploreLoading, setExploreLoading] = useState(false);
  const [bookForm, setBookForm] = useState({
    id: null,
    title: "",
    author: "",
    price: "",
    img: "",
    genre: "General",
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    if (user) {
      setExploreMode(true);
      setGenresOpen(true);
    }
  }, [user]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedGenre]);

  useEffect(() => {
    if (user) return;
    const handleScroll = () => {
      if (window.scrollY > 120) setScrolledPastGate(true);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteVisible(false);
      setTimeout(() => {
        setQuoteIndex((i) => (i + 1) % HERO_QUOTES.length);
        setQuoteVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const fetchBooks = () => {
    fetch("http://localhost:5000/api/books")
      .then((res) => res.json())
      .then((data) => {
        setBooks(data);
        setLoading(false);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    const url = bookForm.id
      ? `http://localhost:5000/api/books/${bookForm.id}`
      : "http://localhost:5000/api/books";
    const method = bookForm.id ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookForm),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to save book");
        return data;
      })
      .then(() => {
        setBookForm({ id: null, title: "", author: "", price: "", img: "", genre: "General" });
        setShowForm(false);
        fetchBooks();
      })
      .catch((err) => setFormError(err.message));
  };

  const handleEdit = (book) => {
    setBookForm(book);
    setShowForm(true);
  };

  const handleExploreClick = () => {
    if (exploreMode) {
      setExploreMode(false);
      setGenresOpen(false);
      return;
    }
    setExploreLoading(true);
    setTimeout(() => {
      setExploreMode(true);
      setGenresOpen(true);
      setShowForm(false);
      setExploreLoading(false);
    }, 700);
  };

  const genres = useMemo(
    () => ["All", ...Array.from(new Set(books.map((b) => b.genre || "General")))],
    [books]
  );

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase());
    const matchesGenre = selectedGenre === "All" || book.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const isGated = !user && scrolledPastGate;

  const PAGE_SIZE = 30;
  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / PAGE_SIZE));
  const paginatedBooks = user
    ? filteredBooks.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
    : filteredBooks;

  return (
    <div className="box-border min-h-screen w-full font-[Poppins,sans-serif]">
      <section className="mb-5 flex flex-col items-center justify-center gap-3 px-5 py-8 text-center">
        <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
          Your Next Chapter Starts Here
        </h1>
        <p className="max-w-lg rounded-full border-2 border-black bg-[#ffd400] px-4 py-1.5 text-sm font-bold text-black sm:text-base">
          Handpicked stories worth swinging into
        </p>
        <p
          className={`flex h-14 max-w-md items-center justify-center px-4 text-sm text-white/70 italic transition-opacity duration-400 ease-in-out sm:h-12 sm:text-base ${
            quoteVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          "{HERO_QUOTES[quoteIndex]}"
        </p>
      </section>

      <div className="mx-auto max-w-375 px-5 pb-10 lg:pl-64">
        {user && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="mx-auto mb-5 block rounded-full border-2 border-black bg-[#38bdf8] px-6.25 py-2.5 text-[15px] font-bold text-black shadow-[3px_3px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000] active:translate-y-0 active:shadow-none lg:hidden"
          >
            {bookForm.id ? "✏️ Edit Book" : "➕ Add Book"}
          </button>
        )}

        {user && showForm && (
          <form
            onSubmit={handleSubmit}
            className="mx-auto mb-7.5 flex max-w-100 flex-col gap-2.5 rounded-2xl border-2 border-black bg-white/95 p-4 shadow-[5px_5px_0_#000]"
          >
            {formError && (
              <p className="m-0 text-center text-sm font-bold text-[#e0245e]">{formError}</p>
            )}
            <input
              placeholder="Title"
              value={bookForm.title}
              onChange={(e) =>
                setBookForm({ ...bookForm, title: e.target.value })
              }
              className="rounded-lg border-2 border-black px-3 py-2 text-sm outline-none"
            />
            <input
              placeholder="Author"
              value={bookForm.author}
              onChange={(e) =>
                setBookForm({ ...bookForm, author: e.target.value })
              }
              className="rounded-lg border-2 border-black px-3 py-2 text-sm outline-none"
            />
            <input
              placeholder="Price"
              value={bookForm.price}
              onChange={(e) =>
                setBookForm({ ...bookForm, price: e.target.value })
              }
              className="rounded-lg border-2 border-black px-3 py-2 text-sm outline-none"
            />
            <input
              placeholder="Image URL"
              value={bookForm.img}
              onChange={(e) => setBookForm({ ...bookForm, img: e.target.value })}
              className="rounded-lg border-2 border-black px-3 py-2 text-sm outline-none"
            />
            <select
              value={bookForm.genre}
              onChange={(e) => setBookForm({ ...bookForm, genre: e.target.value })}
              className="rounded-lg border-2 border-black px-3 py-2 text-sm outline-none"
            >
              {GENRE_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-full border-2 border-black bg-[#ffd400] px-6.25 py-2.5 text-[15px] font-bold text-black shadow-[3px_3px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000] active:translate-y-0 active:shadow-none"
            >
              {bookForm.id ? "Update Book" : "Add Book"}
            </button>
          </form>
        )}

        <div className="mb-5 flex flex-wrap justify-center gap-2.5 lg:hidden">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`rounded-full border-2 border-black px-4 py-1.5 text-sm font-bold shadow-[2px_2px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#000] active:translate-y-0 active:shadow-none ${
                selectedGenre === genre
                  ? "bg-[#ffd400] text-black"
                  : "bg-white text-black"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        <div className="lg:flex lg:items-start lg:gap-8">
          <aside className="hidden lg:fixed lg:top-24 lg:left-4 lg:z-30 lg:block lg:h-[calc(100vh-7rem)] lg:w-52">
            <div className="flex h-full flex-col overflow-y-auto rounded-2xl border-2 border-black bg-white/95 p-4 shadow-[4px_4px_0_#000]">
              {user && !exploreMode && (
                <div className="mb-4 border-b-2 border-black/10 pb-4">
                  <p className="mb-2 text-sm font-extrabold text-black">List Your Book</p>
                  <button
                    onClick={() => setShowForm(!showForm)}
                    className="w-full rounded-lg border-2 border-black bg-[#38bdf8] px-3 py-2 text-sm font-bold text-black shadow-[2px_2px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#000]"
                  >
                    {bookForm.id ? "Edit Book" : "Add Book"}
                  </button>
                </div>
              )}

              <div className={user ? "" : "flex-1"}>
                <p className="mb-2 text-sm font-extrabold text-black">Explore Books</p>
                <button
                  onClick={handleExploreClick}
                  disabled={exploreLoading}
                  className="mb-2 w-full rounded-lg border-2 border-black bg-white px-3 py-2 text-left text-sm font-bold text-black shadow-[2px_2px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#000] disabled:cursor-wait disabled:opacity-70"
                >
                  {exploreLoading
                    ? "Loading..."
                    : exploreMode
                    ? "Exit Explore Mode"
                    : "Browse Genres ▼"}
                </button>

                {exploreLoading && (
                  <div className="flex items-center justify-center py-6">
                    <span className="animate-bounce text-3xl">📖</span>
                  </div>
                )}

                {!exploreLoading && genresOpen && (
                  <div className="flex flex-col gap-1.5">
                    {genres.map((genre) => (
                      <button
                        key={genre}
                        onClick={() => setSelectedGenre(genre)}
                        className={`rounded-lg px-3 py-1.5 text-left text-sm font-semibold transition-colors ${
                          selectedGenre === genre
                            ? "bg-[#ffd400] text-black"
                            : "text-black/70 hover:bg-black/5"
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {user && (
                <button
                  onClick={() => {
                    logout();
                    clearCart();
                    navigate("/");
                  }}
                  className="mt-4 rounded-lg border-2 border-black bg-white px-3 py-2 text-sm font-bold text-black shadow-[2px_2px_0_#000] transition-all hover:-translate-y-0.5 hover:bg-black hover:text-white hover:shadow-[3px_3px_0_#000]"
                >
                  Logout
                </button>
              )}
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div
              className={`grid grid-cols-2 gap-5 transition-all duration-500 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 ${
                isGated ? "pointer-events-none blur-md select-none" : ""
              }`}
            >
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              ) : paginatedBooks.length > 0 ? (
                paginatedBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    canEdit={!!user && !exploreMode}
                    onEdit={() => handleEdit(book)}
                  />
                ))
              ) : (
                <p className="w-full text-center text-lg font-bold text-white">
                  🙈 No books found... try another search!
                </p>
              )}
            </div>

            {user && !loading && totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-full border-2 border-black bg-white px-4 py-1.5 text-sm font-bold text-black shadow-[2px_2px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#000] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-[2px_2px_0_#000]"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-9 w-9 rounded-full border-2 border-black text-sm font-bold shadow-[2px_2px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#000] ${
                      currentPage === page ? "bg-[#ffd400] text-black" : "bg-white text-black"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-full border-2 border-black bg-white px-4 py-1.5 text-sm font-bold text-black shadow-[2px_2px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#000] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-[2px_2px_0_#000]"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isGated && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="mx-4 flex max-w-100 flex-col items-center gap-2 rounded-2xl border-2 border-black bg-white p-6 text-center shadow-[6px_6px_0_#000]">
            <p className="text-base font-bold text-black">Want to keep browsing?</p>
            <p className="text-sm text-[#5b6362]">Log in to unlock the full collection.</p>
            <Link
              to="/login"
              className="mt-2 rounded-full border-2 border-black bg-[#ffd400] px-6 py-2 text-sm font-bold text-black no-underline shadow-[3px_3px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000]"
            >
              Login to see more
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function BookCard({ book, canEdit, onEdit }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const rating = ratingFor(book.id);

  const handleAddToCart = () => {
    addToCart(book);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="group w-full overflow-hidden rounded-2xl border-[3px] border-black bg-white shadow-[6px_6px_0_#000] transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-1.5 hover:shadow-[9px_9px_0_#000]">
      <div className="relative aspect-3/4 w-full overflow-hidden border-b-[3px] border-black bg-white">
        <img
          src={book.img}
          alt={book.title}
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-1"
        />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-4 bg-linear-to-r from-black/45 via-black/15 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 left-4 w-px bg-white/40" />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-1/3 -translate-x-[150%] -skew-x-12 bg-linear-to-r from-transparent via-white/60 to-transparent opacity-0 transition-all duration-700 ease-out group-hover:translate-x-[350%] group-hover:opacity-100" />
        </div>
        <span className="absolute top-2.5 left-2.5 rounded-full border-2 border-black bg-[#7c3aed] px-2.5 py-1 text-[11px] font-bold text-white">
          {book.genre || "General"}
        </span>
        <span className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full border-2 border-black bg-[#ffd400] px-2 py-1 text-[11px] font-extrabold text-black">
          ★ {rating.toFixed(1)}
        </span>
      </div>
      <div className="p-4 text-center">
        <h3 className="mb-1 line-clamp-2 min-h-10 text-[17px] font-bold text-black">
          {book.title}
        </h3>
        <p className="mb-2.5 text-sm text-[#5b6362] italic">by {book.author}</p>
        <span className="mb-3 inline-block rounded-lg border-2 border-black bg-[#ff4d8d] px-3 py-1 text-lg font-extrabold text-black">
          ₹{book.price}
        </span>
        {canEdit ? (
          <button
            onClick={onEdit}
            className="w-full rounded-full border-2 border-black bg-[#38bdf8] px-6 py-2.5 text-[15px] font-bold text-black shadow-[3px_3px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000] active:translate-y-0 active:shadow-none"
          >
            ✏️ Edit
          </button>
        ) : (
          <button
            onClick={handleAddToCart}
            className="w-full rounded-full border-2 border-black bg-[#ffd400] px-6 py-2.5 text-[15px] font-bold text-black shadow-[3px_3px_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000] active:translate-y-0 active:shadow-none"
          >
            {added ? "Added ✓ 🎉" : "🛒 Yoink it!"}
          </button>
        )}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="w-full animate-pulse overflow-hidden rounded-2xl border-[3px] border-black/30 bg-white/10">
      <div className="aspect-3/4 w-full border-b-[3px] border-black/30 bg-white/10" />
      <div className="p-4">
        <div className="mx-auto mb-2 h-4 w-3/4 rounded bg-white/10" />
        <div className="mx-auto mb-3 h-3 w-1/2 rounded bg-white/10" />
        <div className="mx-auto mb-4 h-5 w-1/3 rounded bg-white/10" />
        <div className="mx-auto h-9 w-full rounded-full bg-white/10" />
      </div>
    </div>
  );
}

export default Home;