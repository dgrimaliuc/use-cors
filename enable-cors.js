const express = require('express');

process.env.CORSANYWHERE_WHITELIST = 'https://localhost';

var app = express();
var cors = require('cors');
const { isValidHostName, withCORS } = require('./lib/utils');
app.use(express.json());

app.use(
  cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept',
    credentials: true,
  })
);

app.post('/**', async function (req, res) {
  if (!req.body.url) {
    res.status(400).json({ error: 'No URL specified' });
    return;
  }

  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  );
  res.header('Access-Control-Allow-Credentials', true);
  // res.json({ message: 'Hello World', success: true });

  var url = req.body.url;
  // console.log('Requesting:', url);
  try {
    const resp = await fetch(url);
    resp.text().then((text) => {
      // console.log('Response:', text);
      res.end(text);
    });
  } catch (err) {
    console.error('Error proxying request:', err);
    res
      .status(500)
      .json({ error: 'An error occurred while proxying the request' });
  }
});

var PORT = process.env.PORT || 8989;

app.listen(PORT, function () {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
