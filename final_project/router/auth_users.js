const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
  let userswithsamename = users.filter((user) => user.username === username);
  return userswithsamename.length > 0;
}

const authenticatedUser = (username, password) => {
  let validusers = users.filter((user) => user.username === username && user.password === password);
  return validusers.length > 0;
};

regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken, username
    };

    return res.status(200).json({ message: "User successfully logged in" });
  } else {
    return res.status(281).json({ message: "Invalid Login. Check username and password" });
  }
});

regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const reviewText = req.query.review; 
  const username = req.session.authorization ? req.session.authorization['username'] : null;

  if (!username) {
    return res.status(403).json({ message: "User not authenticated" });
  }

  if (!reviewText) {
    return res.status(400).json({ message: "Review text is required in the query parameter" });
  }

  if (books[isbn]) {
    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }
    books[isbn].reviews[username] = reviewText;
    return res.status(200).json({ 
      message: `The review for the book with ISBN ${isbn} has been added/updated.` 
    });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization ? req.session.authorization['username'] : null;

  if (!username) {
    return res.status(403).json({ message: "User not authenticated" });
  }

  if (books[isbn]) {
    let bookReviews = books[isbn].reviews;

    if (bookReviews && bookReviews[username]) {
      delete bookReviews[username];
      return res.status(200).json({ 
        message: `Reviews for the ISBN ${isbn} posted by the user ${username} have been deleted.` 
      });
    } else {
      return res.status(404).json({ message: `No review found for user ${username} under this ISBN.` });
    }
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;