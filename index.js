const express = require('express');

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.get('/**', async (req, res) => {
  const url = req.url.substring(1);
  console.log(url);
  // const requestUrl = req.body.url.match(/https.+/g)[0];
  const response = await fetch(url);
  const text = await response.text();

  res.send(text);
});

const PORT = process.env.PORT || 8989;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
