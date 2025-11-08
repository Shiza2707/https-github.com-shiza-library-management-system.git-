// Book storage using Map for hashing (ISBN as key)
let books = new Map();
let currentPage = 'dashboard';
const API_BASE = 'http://localhost:3000';

// Load books from server
async function loadBooks() {
    try {
        const response = await fetch(`${API_BASE}/books`);
        if (response.ok) {
            const booksArray = await response.json();
            books = new Map(booksArray.map(book => [book.isbn, book]));
        } else {
            console.error('Failed to load books from server');
        }
    } catch (error) {
        console.error('Error loading books:', error);
    }
}

// Navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    document.getElementById(pageId + '-btn').classList.add('active');
    currentPage = pageId;
    if (pageId === 'list') displayBooks();
    updateStats();
}

// Function to add or update a book
async function saveBook(title, author, isbn, year, image, editIsbn = null) {
    try {
        const method = editIsbn ? 'PUT' : 'POST';
        const url = editIsbn ? `${API_BASE}/books/${editIsbn}` : `${API_BASE}/books`;
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, author, isbn, year, image })
        });
        if (response.ok) {
            const savedBook = await response.json();
            books.set(savedBook.isbn, savedBook);
            if (editIsbn && editIsbn !== isbn) {
                books.delete(editIsbn);
            }
            updateStats();
            return true;
        } else {
            const error = await response.json();
            alert(error.error);
            return false;
        }
    } catch (error) {
        console.error('Error saving book:', error);
        alert('Failed to save book. Please try again.');
        return false;
    }
}

// Function to delete a book
async function deleteBook(isbn) {
    if (confirm('Are you sure you want to delete this book?')) {
        try {
            const response = await fetch(`${API_BASE}/books/${isbn}`, { method: 'DELETE' });
            if (response.ok) {
                books.delete(isbn);
                updateStats();
                if (currentPage === 'list') displayBooks();
            } else {
                alert('Failed to delete book.');
            }
        } catch (error) {
            console.error('Error deleting book:', error);
            alert('Failed to delete book. Please try again.');
        }
    }
}

// Function to edit a book
function editBook(isbn) {
    const book = books.get(isbn);
    if (book) {
        document.getElementById('edit-isbn').value = isbn;
        document.getElementById('book-title').value = book.title;
        document.getElementById('book-author').value = book.author;
        document.getElementById('book-isbn').value = book.isbn;
        document.getElementById('book-year').value = book.year;
        document.getElementById('book-image').value = book.image;
        showPage('add');
    }
}

// Function to lookup a book by ISBN
async function lookupBook(isbn) {
    try {
        const response = await fetch(`${API_BASE}/books/${isbn}`);
        const resultDiv = document.getElementById('search-result');
        if (response.ok) {
            const book = await response.json();
            resultDiv.innerHTML = `
                <h2>Book Found</h2>
                <img src="${book.image}" alt="${book.title}" class="book-image">
                <p><strong>Title:</strong> ${book.title}</p>
                <p><strong>Author:</strong> ${book.author}</p>
                <p><strong>ISBN:</strong> ${book.isbn}</p>
                <p><strong>Publication Year:</strong> ${book.year}</p>
            `;
        } else {
            resultDiv.innerHTML = '<h2>Book not found</h2><p>Please check the ISBN and try again.</p>';
        }
    } catch (error) {
        console.error('Error looking up book:', error);
        document.getElementById('search-result').innerHTML = '<h2>Error</h2><p>Failed to search for book. Please try again.</p>';
    }
}

// Function to display books sorted by title
function displayBooks(filter = '') {
    const bookCards = document.getElementById('book-cards');
    bookCards.innerHTML = '';
    const sortedBooks = Array.from(books.values()).sort((a, b) => a.title.localeCompare(b.title));
    const filteredBooks = sortedBooks.filter(book =>
        book.title.toLowerCase().includes(filter.toLowerCase()) ||
        book.author.toLowerCase().includes(filter.toLowerCase()) ||
        book.isbn.toLowerCase().includes(filter.toLowerCase())
    );
    filteredBooks.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.innerHTML = `
            <img src="${book.image}" alt="${book.title}" class="book-image">
            <div class="book-details">
                <h3>${book.title}</h3>
                <p><strong>Author:</strong> ${book.author}</p>
                <p><strong>ISBN:</strong> ${book.isbn}</p>
                <p><strong>Year:</strong> ${book.year}</p>
            </div>
            <div class="card-actions">
                <button class="edit-btn" onclick="editBook('${book.isbn}')">✏️ Edit</button>
                <button class="delete-btn" onclick="deleteBook('${book.isbn}')">🗑️ Delete</button>
            </div>
        `;
        bookCards.appendChild(card);
    });
}

// Update stats
function updateStats() {
    document.getElementById('total-books').textContent = books.size;
}

// Event listeners
document.getElementById('dashboard-btn').addEventListener('click', () => showPage('dashboard'));
document.getElementById('search-btn').addEventListener('click', () => showPage('search'));
document.getElementById('list-btn').addEventListener('click', () => showPage('list'));
document.getElementById('add-btn').addEventListener('click', () => showPage('add'));

document.getElementById('dashboard-search-btn').addEventListener('click', function() {
    const isbn = document.getElementById('dashboard-search').value;
    if (isbn) {
        lookupBook(isbn);
        showPage('search');
        document.getElementById('search-isbn').value = isbn;
    }
});

document.getElementById('view-all-btn').addEventListener('click', () => showPage('list'));

document.getElementById('search-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const isbn = document.getElementById('search-isbn').value;
    lookupBook(isbn);
});

document.getElementById('filter-search').addEventListener('input', function() {
    displayBooks(this.value);
});

document.getElementById('book-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const title = document.getElementById('book-title').value;
    const author = document.getElementById('book-author').value;
    const isbn = document.getElementById('book-isbn').value;
    const year = document.getElementById('book-year').value;
    const image = document.getElementById('book-image').value;
    const editIsbn = document.getElementById('edit-isbn').value;
    if (saveBook(title, author, isbn, year, image, editIsbn)) {
        this.reset();
        document.getElementById('edit-isbn').value = '';
        showPage('list');
    }
});

document.getElementById('cancel-edit').addEventListener('click', function() {
    document.getElementById('book-form').reset();
    document.getElementById('edit-isbn').value = '';
    showPage('list');
});

// Initialize
loadBooks();
updateStats();
