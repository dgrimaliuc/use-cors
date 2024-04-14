const express = require('express');

var app = express();
var cors = require('cors');
const { isValidHostName, withCORS, getHandler } = require('./lib/utils');
app.use(express.json());

app.use(
  cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept',
    credentials: true,
  })
);

app.post('/**', async (req, res) => {
  getHandler(req, res);
});

var PORT = process.env.PORT || 8989;

app.listen(PORT, function () {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;