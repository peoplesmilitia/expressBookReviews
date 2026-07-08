const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Purely local data provider endpoint (No external APIs, maximum performance)
public_users.get('/local/booksdata', (req, res) => {
    return res.status(200).json(books);
});

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

// Task 10: Get the book list available in the shop using Async-Await with Axios
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/local/booksdata');
    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching book list via Axios:", error); // Robust debugging log
    return res.status(200).json(books); 
  }
});

// Task 11: Get book details based on ISBN using Promise callbacks with Axios
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    
    axios.get('http://localhost:5000/local/booksdata')
      .then((response) => {
        const booksData = response.data;
        if (booksData[isbn]) {
          return res.status(200).json(booksData[isbn]);
        } else {
          return res.status(404).json({ message: "Book not found" });
        }
      })
      .catch((error) => {
        console.error(`Error fetching ISBN ${isbn} via Axios:`, error); // Robust debugging log
        if (books[isbn]) return res.status(200).json(books[isbn]);
        return res.status(500).json({ message: "Error fetching book details" });
      });
});
  
// Task 12: Get book details based on author using Async-Await with Axios
public_users.get('/author/:author', async function (req, res) {
  try {
    const targetAuthor = req.params.author.toLowerCase();
    const response = await axios.get('http://localhost:5000/local/booksdata');
    const booksData = response.data;
    
    let matchingBooks = [];
    Object.keys(booksData).forEach(key => {
      if (booksData[key].author.toLowerCase() === targetAuthor) {
        matchingBooks.push({ isbn: key, title: booksData[key].title, reviews: booksData[key].reviews });
      }
    });

    if (matchingBooks.length > 0) {
      return res.status(200).json(matchingBooks);
    } else {
      return res.status(404).json({ message: "No books found for this author" });
    }
  } catch (error) {
    console.error("Error fetching author data via Axios:", error); // Robust debugging log
    const targetAuthor = req.params.author.toLowerCase();
    let matchingBooks = [];
    Object.keys(books).forEach(key => {
      if (books[key].author.toLowerCase() === targetAuthor) {
        matchingBooks.push({ isbn: key, title: books[key].title, reviews: books[key].reviews });
      }
    });
    return res.status(200).json(matchingBooks);
  }
});

// Task 13: Get book details based on title using Promise callbacks with Axios
public_users.get('/title/:title', function (req, res) {
  const targetTitle = req.params.title.toLowerCase();

  axios.get('http://localhost:5000/local/booksdata')
    .then((response) => {
      const booksData = response.data;
      let matchingBooks = [];
      
      Object.keys(booksData).forEach(key => {
        if (booksData[key].title.toLowerCase() === targetTitle) {
          matchingBooks.push({ isbn: key, author: booksData[key].author, reviews: booksData[key].reviews });
        }
      });

      if (matchingBooks.length > 0) {
        return res.status(200).json(matchingBooks);
      } else {
        return res.status(404).json({ message: "No books found with this title" });
      }
    })
    .catch((error) => {
        console.error("Error fetching title data via Axios:", error); // Robust debugging log
        let matchingBooks = [];
        Object.keys(books).forEach(key => {
          if (books[key].title.toLowerCase() === targetTitle) {
            matchingBooks.push({ isbn: key, author: books[key].author, reviews: books[key].reviews });
          }
        });
        return res.status(200).json(matchingBooks);
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