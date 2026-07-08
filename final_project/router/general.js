const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Task 6: Register user
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    if (isValid(username)) { 
      return res.status(409).json({ message: "Username already exists!" });
    }
  
    users.push({ "username": username, "password": password });
    return res.status(201).json({ message: "User successfully registered. Now you can login" });
});

// Task 10: Get the book list available in the shop using Async-Await
public_users.get('/', async function (req, res) {
  try {
    const fetchBooks = () => {
      return new Promise((resolve) => {
        resolve(books);
      });
    };
    const bookList = await fetchBooks();
    return res.status(200).json(bookList);
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books" });
  }
});

// Task 11: Get book details based on ISBN using Promise callbacks
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
  
    const fetchBookByISBN = new Promise((resolve, reject) => {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject({ status: 404, message: "Book not found" });
      }
    });
  
    fetchBookByISBN
      .then((bookDetails) => {
        return res.status(200).json(bookDetails);
      })
      .catch((error) => {
        return res.status(error.status || 500).json({ message: error.message });
      });
});
  
// Task 12: Get book details based on author using Async-Await
public_users.get('/author/:author', async function (req, res) {
  try {
    const targetAuthor = req.params.author.toLowerCase();
    
    const fetchBooksByAuthor = () => {
      return new Promise((resolve, reject) => {
        const keys = Object.keys(books);
        let matchingBooks = [];

        keys.forEach(key => {
          if (books[key].author.toLowerCase() === targetAuthor) {
            matchingBooks.push({
              isbn: key,
              title: books[key].title,
              reviews: books[key].reviews
            });
          }
        });

        if (matchingBooks.length > 0) {
          resolve(matchingBooks);
        } else {
          reject({ status: 404, message: "No books found for this author" });
        }
      });
    };

    const records = await fetchBooksByAuthor();
    return res.status(200).json(records);

  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
});

// Task 13: Get book details based on title using Promise callbacks
public_users.get('/title/:title', function (req, res) {
  const targetTitle = req.params.title.toLowerCase();

  const fetchBooksByTitle = new Promise((resolve, reject) => {
    const keys = Object.keys(books);
    let matchingBooks = [];

    keys.forEach(key => {
      if (books[key].title.toLowerCase() === targetTitle) {
        matchingBooks.push({
          isbn: key,
          author: books[key].author,
          reviews: books[key].reviews
        });
      }
    });

    if (matchingBooks.length > 0) {
      resolve(matchingBooks);
    } else {
      reject({ status: 404, message: "No books found with this title" });
    }
  });

  fetchBooksByTitle
    .then((matchingBooks) => {
      return res.status(200).json(matchingBooks);
    })
    .catch((error) => {
      return res.status(error.status || 500).json({ message: error.message });
    });
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).json(books[isbn].reviews);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;