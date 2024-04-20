const express = require('express');
const app = express();

if (!process.env.LOCAL) {
  app.use(express.json());
}

const corsRoutes = require('./routes/enable-cors');

// Mount routes
app.use('/', corsRoutes);

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});

module.exports = app;
