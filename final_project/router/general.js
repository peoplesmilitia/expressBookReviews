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
    // ASYNC LOGIC: Wrapping the local data in a self-resolving Promise to mock an HTTP fetch operation
    const fetchBooksAsync = () => {
      return new Promise((resolve) => {
        resolve(books);
      });
    };
    
    const bookList = await fetchBooksAsync();
    return res.status(200).json(bookList);
  } catch (error) {
    // ERROR HANDLING: Document unexpected evaluation errors to the console log interface
    console.error("Exception caught during async book retrieval:", error);
    return res.status(500).json({ message: "Internal server error retrieving books" });
  }
});

// Task 11: Get book details based on ISBN using Promise callbacks
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
  
    // ASYNC LOGIC: Using a Promise constructor to simulate a database query lookup sequence
    const fetchBookByISBNAsync = new Promise((resolve, reject) => {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject({ status: 404, message: "Book record not located" });
      }
    });
  
    // PROMISE CHAINING: Handle resolve and reject logic outputs cleanly
    fetchBookByISBNAsync
      .then((bookDetails) => {
        return res.status(200).json(bookDetails);
      })
      .catch((error) => {
        // ERROR HANDLING: Direct caught errors into appropriate status code response structures
        console.error(`Exception caught during ISBN lookup for ${isbn}:`, error);
        return res.status(error.status || 500).json({ message: error.message });
      });
});
  
// Task 12: Get book details based on author using Async-Await
public_users.get('/author/:author', async function (req, res) {
  try {
    const targetAuthor = req.params.author.toLowerCase();
    
    // ASYNC LOGIC: Isolating filtering loop routines inside an independent microtask promise
    const fetchBooksByAuthorAsync = () => {
      return new Promise((resolve, reject) => {
        const keys = Object.keys(books);
        let matchingBooks = [];

        // FILTERING LOGIC: Iterating through keys to find records matching target author string properties
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
          reject({ status: 404, message: "No records matching this author criteria" });
        }
      });
    };

    const records = await fetchBooksByAuthorAsync();
    return res.status(200).json(records);

  } catch (error) {
    // ERROR HANDLING: Handle structural filtering faults cleanly without terminating server state
    console.error("Exception caught during author array filtering:", error);
    return res.status(error.status || 500).json({ message: error.message });
  }
});

// Task 13: Get book details based on title using Promise callbacks
public_users.get('/title/:title', function (req, res) {
  const targetTitle = req.params.title.toLowerCase();

  // ASYNC LOGIC: Instantiating explicit promise structure to maintain pipeline conventions
  const fetchBooksByTitleAsync = new Promise((resolve, reject) => {
    const keys = Object.keys(books);
    let matchingBooks = [];

    // FILTERING LOGIC: Iterating across stored schemas to isolate books using matching target title values
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
      reject({ status: 404, message: "No records matching this title criteria" });
    }
  });

  // PROMISE CHAINING: Process clean asynchronous returns
  fetchBooksByTitleAsync
    .then((matchingBooks) => {
      return res.status(200).json(matchingBooks);
    })
    .catch((error) => {
      // ERROR HANDLING: Provide granular context logs to ensure structural transparency
      console.error("Exception caught during title data aggregation:", error);
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