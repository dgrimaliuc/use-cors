const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  console.log('req.headers', req.headers);
  console.log('req.body', req.body);
  res.send('Hello World!');
});

// Add more routes as needed

module.exports = router;
