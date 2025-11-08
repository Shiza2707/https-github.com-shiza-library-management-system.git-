const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const BOOKS_FILE = path.join(__dirname, 'books.json');

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Ensure books.json exists
if (!fs.existsSync(BOOKS_FILE)) {
  fs.writeFileSync(BOOKS_FILE, JSON.stringify([]));
}

// Get all books
app.get('/api/books', (req, res) => {
  try {
    const books = JSON.parse(fs.readFileSync(BOOKS_FILE, 'utf8'));
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read books' });
  }
});

// Add or update a book
app.post('/api/books', (req, res) => {
  try {
    const { title, author, isbn, year, image } = req.body;
    const books = JSON.parse(fs.readFileSync(BOOKS_FILE, 'utf8'));
    const existingIndex = books.findIndex(book => book.isbn === isbn);

    if (existingIndex !== -1) {
      books[existingIndex] = { title, author, isbn, year, image };
    } else {
      books.push({ title, author, isbn, year, image });
    }

    fs.writeFileSync(BOOKS_FILE, JSON.stringify(books, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save book' });
  }
});

// Delete a book
app.delete('/api/books/:isbn', (req, res) => {
  try {
    const isbn = req.params.isbn;
    let books = JSON.parse(fs.readFileSync(BOOKS_FILE, 'utf8'));
    books = books.filter(book => book.isbn !== isbn);
    fs.writeFileSync(BOOKS_FILE, JSON.stringify(books, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
