const express = require("express");
const app = express();
require("./connection/connection.js");
const cors = require("cors");
const UserAPI = require("./routes/user.js");
const TaskAPI = require("./routes/task.js");
require('dotenv').config();
const path = require('path');
const jwt = require('jsonwebtoken'); // Make sure to install this package

app.use(cors());
app.use(express.json());

// Token verification middleware
const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  } else {
    res.sendStatus(403);
  }
};

// Token verification endpoint
app.post('/api/v1/verify-token', verifyToken, (req, res) => {
  jwt.verify(req.token, process.env.JWT_SECRET, (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      res.json({
        message: 'Token is valid',
        authData
      });
    }
  });
});

app.use("/api/v1", UserAPI);
app.use("/api/v2", TaskAPI);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server Started on port ${PORT}`);
});

module.exports = app;