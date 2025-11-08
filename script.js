// Book storage using Map for hashing (ISBN as key)
let books = new Map();
let currentPage = 'dashboard';

// Load books from server
async function loadBooks() {
    try {
        const response = await fetch('/api/books');
        const booksArray = await response.json();
        books = new Map(booksArray.map(book => [book.isbn, book]));
    } catch (error) {
        console.error('Failed to load books:', error);
    }
}

// Save books to server
async function saveBooks() {
    // This function is now handled by individual API calls
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
        const response = await fetch('/api/books', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, author, isbn, year, image: image || 'https://via.placeholder.com/100x150/333/fff?text=No+Image' })
        });
        if (response.ok) {
            await loadBooks();
            updateStats();
            return true;
        } else {
            const error = await response.json();
            alert('Failed to save book: ' + error.error);
            return false;
        }
    } catch (error) {
        console.error('Failed to save book:', error);
        alert('Failed to save book');
        return false;
    }
}

// Function to delete a book
async function deleteBook(isbn) {
    if (confirm('Are you sure you want to delete this book?')) {
        try {
            const response = await fetch(`/api/books/${isbn}`, { method: 'DELETE' });
            if (response.ok) {
                await loadBooks();
                updateStats();
                if (currentPage === 'list') displayBooks();
            } else {
                alert('Failed to delete book');
            }
        } catch (error) {
            console.error('Failed to delete book:', error);
            alert('Failed to delete book');
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
function lookupBook(isbn) {
    const book = books.get(isbn);
    const resultDiv = document.getElementById('search-result');
    if (book) {
        resultDiv.innerHTML = `
            <div class="book-card">
                <img src="${book.image}" alt="${book.title}">
                <h3>${book.title}</h3>
                <p>Author: ${book.author}</p>
                <p>ISBN: ${book.isbn}</p>
                <p>Year: ${book.year}</p>
                <div class="card-actions">
                    <button class="edit-btn" onclick="editBook('${book.isbn}')">✏️ Edit</button>
                    <button class="delete-btn" onclick="deleteBook('${book.isbn}')">🗑️ Delete</button>
                </div>
            </div>
        `;
    } else {
        resultDiv.innerHTML = '<p>No book found with that ISBN.</p>';
    }
}

// Function to display books
function displayBooks(filter = '') {
    const bookCards = document.getElementById('book-cards');
    bookCards.innerHTML = '';
    const filteredBooks = Array.from(books.values()).filter(book =>
        book.title.toLowerCase().includes(filter.toLowerCase()) ||
        book.author.toLowerCase().includes(filter.toLowerCase()) ||
        book.isbn.includes(filter)
    );
    filteredBooks.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.innerHTML = `
            <img src="${book.image}" alt="${book.title}">
            <h3>${book.title}</h3>
            <p>Author: ${book.author}</p>
            <p>ISBN: ${book.isbn}</p>
            <p>Year: ${book.year}</p>
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
