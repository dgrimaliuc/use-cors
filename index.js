// const express = require('express');
// const config = require('./config');
// const app = express();
// // const conf

// if (!config.local) {
//   app.use(express.json());
//   app.use(express.urlencoded());
// }

// const corsRoutes = require('./routes/enable-cors');

// // Mount routes
// app.use('/', corsRoutes);

// if (!config.local)
//   app.listen(3101, () => {
//     console.log('Server is running on port 3101');
//   });

// module.exports = app;

// export const config = {
//   runtime: 'edge',
// };

export default async function handler(req, res) {
  const startIndex = req.url.lastIndexOf('http');
  const url = req.url.substring(startIndex);

  console.log('body.favs', req.body);

  if (!url || !url.includes('https')) {
    res.status(400).send('Invalid URL');
  }

  const resp = await fetch(url, {
    headers: { ...req.headers },
    method: req.method,
    body: new URLSearchParams(req.body),
  });
  res.status(200).send(await resp.json());
}
