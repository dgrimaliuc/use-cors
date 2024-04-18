const express = require('express');
const app = express();

console.log('LOCAL: ', process.env.LOCAL);

if (!process.env.LOCAL) {
  app.use(express.json());
}

const corsRoutes = require('./routes/enable-cors');
const testRoutes = require('./routes/server');

// Mount routes
app.use('/', corsRoutes);
app.use('/test', testRoutes);

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});

module.exports = app;
