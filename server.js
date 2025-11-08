const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const BOOKS_FILE = path.join(__dirname, 'books.json');

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to read books from file
function readBooks() {
    if (!fs.existsSync(BOOKS_FILE)) {
        return {};
    }
    const data = fs.readFileSync(BOOKS_FILE, 'utf8');
    return JSON.parse(data);
}

// Helper function to write books to file
function writeBooks(books) {
    fs.writeFileSync(BOOKS_FILE, JSON.stringify(books, null, 2));
}

// Routes
app.get('/books', (req, res) => {
    const books = readBooks();
    res.json(Object.values(books));
});

app.get('/books/:isbn', (req, res) => {
    const books = readBooks();
    const book = books[req.params.isbn];
    if (book) {
        res.json(book);
    } else {
        res.status(404).json({ error: 'Book not found' });
    }
});

app.post('/books', (req, res) => {
    const { title, author, isbn, year, image } = req.body;
    if (!title || !author || !isbn || !year) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const books = readBooks();
    if (books[isbn]) {
        return res.status(409).json({ error: 'Book with this ISBN already exists' });
    }
    books[isbn] = { title, author, isbn, year, image: image || 'https://via.placeholder.com/100x150/333/fff?text=No+Image' };
    writeBooks(books);
    res.status(201).json(books[isbn]);
});

app.put('/books/:isbn', (req, res) => {
    const { title, author, isbn: newIsbn, year, image } = req.body;
    if (!title || !author || !newIsbn || !year) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const books = readBooks();
    if (!books[req.params.isbn]) {
        return res.status(404).json({ error: 'Book not found' });
    }
    if (req.params.isbn !== newIsbn && books[newIsbn]) {
        return res.status(409).json({ error: 'Book with this ISBN already exists' });
    }
    delete books[req.params.isbn];
    books[newIsbn] = { title, author, isbn: newIsbn, year, image: image || 'https://via.placeholder.com/100x150/333/fff?text=No+Image' };
    writeBooks(books);
    res.json(books[newIsbn]);
});

app.delete('/books/:isbn', (req, res) => {
    const books = readBooks();
    if (!books[req.params.isbn]) {
        return res.status(404).json({ error: 'Book not found' });
    }
    delete books[req.params.isbn];
    writeBooks(books);
    res.json({ message: 'Book deleted' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
