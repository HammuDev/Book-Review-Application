// index.js

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Read books data from JSON file
let books = []; // Define books array to hold the data

// Read data from books.json file
fs.readFile('./books.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }
    books = JSON.parse(data); // Parse JSON data and store in the books array
});

// Routes
// Task 1: Get the book list available in the shop
app.get('/books', (req, res) => {
    res.json(books);
});

// Task 2: Get the books based on ISBN
app.get('/books/:isbn', (req, res) => {
    const book = books.find(book => book.ISBN === req.params.isbn);
    if (book) {
        res.json(book);
    } else {
        res.status(404).json({ error: 'Book not found' });
    }
});

/// Task 3: Get all books by Author
app.get('/books/author/:author', (req, res) => {
    const authorName = req.params.author; // No need to convert to lowercase for exact match
    const booksByAuthor = books.filter(book => book.author === authorName);
    if (booksByAuthor.length > 0) {
        res.json(booksByAuthor);
    } else {
        res.status(404).json({ error: 'No books found by this author' });
    }
});


// Task 4: Get all books based on Title
app.get('/books/title/:title', (req, res) => {
    const searchTitle = req.params.title.toLowerCase(); // Convert to lowercase for case-insensitive comparison
    const booksByTitle = books.filter(book => book.title.toLowerCase().includes(searchTitle));
    if (booksByTitle.length > 0) {
        res.json(booksByTitle);
    } else {
        res.status(404).json({ error: 'No books found with this title' });
    }
});

// Task 5: Get book review
app.get('/books/reviews/:isbn', (req, res) => {
    const bookISBN = req.params.isbn;
    const book = books.find(book => book.ISBN === bookISBN);
    if (book) {
        if (book.reviews.length > 0) {
            res.json(book.reviews);
        } else {
            res.status(404).json({ error: 'No reviews found for this book' });
        }
    } else {
        res.status(404).json({ error: 'Book not found' });
    }
});



// Define dummy user data
let users = [
    { id: 1, username: 'user1', email: 'user1@example.com', password: 'password1' },
    { id: 2, username: 'user2', email: 'user2@example.com', password: 'password2' },
    // Add more dummy user data as needed
];

// Task 6: Register New user
app.post('/register', (req, res) => {
    const { username, email, password } = req.body; // Assuming request body contains username, email, and password

    

    // For demonstration purposes, let's just log the registration data
    console.log('New user registered:');
    console.log('Username:', username);
    console.log('Email:', email);
    
    // Add the new user to the dummy user data
    const newUser = { id: users.length + 1, username, email, password };
    users.push(newUser);

    // Send a response indicating successful registration, including the newly registered user data
    const response = {
        message: 'User registered successfully',
        user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
           
        }
    };

    // Send the response in a more readable format
    res.status(200).json(response);
});



// Task 7: Login as a Registered user
app.post('/login', (req, res) => {
    const { username, password } = req.body; // Assuming request body contains username/email and password

  
    // For demonstration purposes, let's just check if the provided username and password match any user
    const user = users.find(user => (user.username === username || user.email === username) && user.password === password);
    if (user) {
        // If user is found, send a success response
        res.status(200).json({ message: 'Login successful', user: { id: user.id, username: user.username, email: user.email } });
    } else {
        // If user is not found or password does not match, send an error response
        res.status(401).json({ error: 'Invalid username/email or password' });
    }
});


// Task 8: Add/Modify a book review
app.post('/books/reviews/:isbn', (req, res) => {
    const { isbn } = req.params; // Extract ISBN from request parameters
    const { username, review, password } = req.body; // Extract username, review, and password from request body

    // Dummy data - replace with your actual data source
    const users = [
        { username: 'user1', email: 'user1@example.com', password: 'password1' },
        { username: 'user2', email: 'user2@example.com', password: 'password2' }
        // Add more dummy user data as needed
    ];

    const books = [
        {
            ISBN: '1234567890',
            reviews: []
        },
        {
            ISBN: '0987654321',
            reviews: []
        }
        // Add more dummy book data as needed
    ];

    

    // Check if the user is authenticated
    const user = users.find(user => (user.username === username || user.email === username) && user.password === password);
    if (!user) {
        return res.status(401).json({ error: 'Authentication failed' });
    }

    // Find the book by ISBN
    const book = books.find(book => book.ISBN === isbn);
    if (!book) {
        return res.status(404).json({ error: `Book with ISBN ${isbn} not found`, availableBooks: books.map(book => book.ISBN) });
    }

    // Check if the user has already reviewed the book
    const existingReviewIndex = book.reviews.findIndex(r => r.username === username);

    if (existingReviewIndex !== -1) {
        // If the user has already reviewed the book, update the review
        book.reviews[existingReviewIndex].review = review;
        res.status(200).json({ message: 'Review modified successfully', review: book.reviews[existingReviewIndex] });
    } else {
        // If the user has not reviewed the book yet, add a new review
        book.reviews.push({ username, review });
        res.status(201).json({ message: 'Review submitted successfully' });
    }
});



// Task 9: Delete book review added by that particular user
app.delete('/books/reviews/:isbn/:username', (req, res) => {
    const { isbn, username } = req.params; // Extract ISBN and username from request parameters

    console.log('Deleting review for ISBN:', isbn, 'and username:', username);

    // Find the book by ISBN
    const book = books.find(book => book.ISBN === isbn);
    if (!book) {
        console.log('Book not found');
        return res.status(404).json({ error: 'Book not found' });
    }

    // Check if the user has reviewed the book
    const reviewIndex = book.reviews.findIndex(r => r.username === username);

    if (reviewIndex !== -1) {
        // Remove the review from the book's reviews array
        book.reviews.splice(reviewIndex, 1);
        console.log('Review deleted successfully');
        return res.status(200).json({ message: 'Review deleted successfully' });
    } else {
        // If the user has not reviewed the book, return an error
        console.log('Review not found for this user');
        return res.status(404).json({ error: 'Review not found for this user' });
    }
});









// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
