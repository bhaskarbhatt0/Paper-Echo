CREATE DATABASE bookstore;
USE bookstore;
CREATE TABLE books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  author VARCHAR(255),
  price VARCHAR(50),
  img VARCHAR(500),
  genre VARCHAR(50) NOT NULL DEFAULT 'General'
);

INSERT INTO books (title, author, price, img, genre) VALUES
('Atomic Habits', 'James Clear', '15', 'http://localhost:5000/images/book1.jpg', 'Self-Help'),
('Ikigai', 'Héctor García', '12', 'http://localhost:5000/images/book2.jpg', 'Self-Help'),
('The Alchemist', 'Paulo Coelho', '10', 'http://localhost:5000/images/book3.jpg', 'Fiction');

select * from books;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  reset_token VARCHAR(255) NULL,
  reset_token_expiry BIGINT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

