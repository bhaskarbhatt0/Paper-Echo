import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import db from "../db.js";
import { sendResetEmail } from "../mailer.js";

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/register", (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Username, email and password are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  db.query(
    "SELECT id FROM users WHERE email = ? OR username = ?",
    [email, username],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (rows.length > 0) {
        return res.status(409).json({ error: "Username or email already registered" });
      }

      bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.status(500).json({ error: "Failed to secure password" });

        db.query(
          "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
          [username, email, hash],
          (err, result) => {
            if (err) return res.status(500).json({ error: "Failed to register user" });
            res.json({ message: "Registered successfully", userId: result.insertId });
          }
        );
      });
    }
  );
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (rows.length === 0) return res.status(401).json({ error: "Invalid email or password" });

    const user = rows[0];
    bcrypt.compare(password, user.password, (err, match) => {
      if (err) return res.status(500).json({ error: "Login failed" });
      if (!match) return res.status(401).json({ error: "Invalid email or password" });

      const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        message: "Login successful",
        token,
        user: { id: user.id, username: user.username, email: user.email },
      });
    });
  });
});

router.post("/forgot-password", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  db.query("SELECT id FROM users WHERE email = ?", [email], (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });

    if (rows.length === 0) {
      return res.json({ message: "If that email is registered, a reset link has been sent" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = Date.now() + 15 * 60 * 1000;

    db.query(
      "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?",
      [token, expiry, email],
      (err) => {
        if (err) return res.status(500).json({ error: "Database error" });

        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
        sendResetEmail(email, resetLink)
          .then(() =>
            res.json({ message: "If that email is registered, a reset link has been sent" })
          )
          .catch((emailErr) => {
            console.error("Failed to send reset email:", emailErr.message);
            res.status(500).json({ error: "Failed to send reset email" });
          });
      }
    );
  });
});

function findAvailableUsername(base, cb) {
  const candidate = base.slice(0, 45);
  db.query("SELECT id FROM users WHERE username = ?", [candidate], (err, rows) => {
    if (err) return cb(err);
    if (rows.length === 0) return cb(null, candidate);
    const suffixed = `${base.slice(0, 40)}${Math.floor(1000 + Math.random() * 9000)}`;
    db.query("SELECT id FROM users WHERE username = ?", [suffixed], (err2, rows2) => {
      if (err2) return cb(err2);
      cb(null, rows2.length === 0 ? suffixed : `${suffixed}${Date.now()}`.slice(0, 50));
    });
  });
}

router.post("/google", async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: "Missing Google credential" });

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    return res.status(401).json({ error: "Invalid Google credential" });
  }

  const { email, name } = payload;
  if (!email) return res.status(400).json({ error: "Google account has no email" });

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });

    const issueToken = (user) => {
      const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      res.json({
        message: "Login successful",
        token,
        user: { id: user.id, username: user.username, email: user.email },
      });
    };

    if (rows.length > 0) return issueToken(rows[0]);

    const baseUsername = (name || email.split("@")[0]).replace(/[^a-zA-Z0-9_]/g, "");
    findAvailableUsername(baseUsername || "user", (err, username) => {
      if (err) return res.status(500).json({ error: "Database error" });

      bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10, (err, hash) => {
        if (err) return res.status(500).json({ error: "Failed to create account" });

        db.query(
          "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
          [username, email, hash],
          (err, result) => {
            if (err) return res.status(500).json({ error: "Failed to create account" });
            issueToken({ id: result.insertId, username, email });
          }
        );
      });
    });
  });
});

router.post("/reset-password/:token", (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  if (!password || password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  db.query(
    "SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > ?",
    [token, Date.now()],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (rows.length === 0) {
        return res.status(400).json({ error: "Reset link is invalid or has expired" });
      }

      const userId = rows[0].id;
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.status(500).json({ error: "Failed to secure password" });

        db.query(
          "UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?",
          [hash, userId],
          (err) => {
            if (err) return res.status(500).json({ error: "Failed to reset password" });
            res.json({ message: "Password reset successfully" });
          }
        );
      });
    }
  );
});

export default router;
