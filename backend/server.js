import "dotenv/config";
import express from "express";
import cors from "cors";
import db from "./db.js";
import authRoutes from "./routes/auth.js";
import { sendContactEmail } from "./mailer.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

const escapeHtml = (str) =>
  str.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[c]);

app.post("/api/contact", (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email and message are required" });
  }

  sendContactEmail(escapeHtml(name), email, escapeHtml(message))
    .then(() => res.json({ message: "Message sent! We'll get back to you soon." }))
    .catch((err) => {
      console.error("Failed to send contact email:", err.message);
      res.status(500).json({ error: "Failed to send message" });
    });
});


app.get("/api/books", (req, res) => {
  db.query("SELECT * FROM books", (err, results) => {
    if (err) return res.status(500).json({ error: "Database query failed" });
    res.json(results);
  });
});

app.post("/api/books", (req, res) => {
  const { title, author, price, img, genre } = req.body;

  db.query(
    "SELECT id FROM books WHERE title = ? AND author = ?",
    [title, author],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Database query failed" });
      if (rows.length > 0) {
        return res.status(409).json({ error: "This book already exists" });
      }

      const query = "INSERT INTO books (title, author, price, img, genre) VALUES (?, ?, ?, ?, ?)";
      db.query(query, [title, author, price, img, genre || "General"], (err, result) => {
        if (err) return res.status(500).json({ error: "Failed to add book" });
        res.json({ message: "Book added successfully", bookId: result.insertId });
      });
    }
  );
});


app.put("/api/books/:id", (req, res) => {
  const { id } = req.params;
  const { title, author, price, img, genre } = req.body;
  const query = "UPDATE books SET title = ?, author = ?, price = ?, img = ?, genre = ? WHERE id = ?";


  db.query(query, [title, author, price, img, genre || "General", id], (err) => {
    if (err) return res.status(500).json({ error: "Failed to update book" });
    res.json({ message: "Book updated successfully" });
  });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Backend running on http://localhost:${PORT}`));


