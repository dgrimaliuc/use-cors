import express from 'express';
import { getCorsHandler, getStreamHandler } from './lib/handlers.js';
import { proxyRequest, removeUnusedHeaders } from './lib/utils.js';
import cors from 'cors';

var app = express();
app.use(express.json());

app.use(
  cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept',
    credentials: true,
  })
);

app.post(
  '/',
  (req, res, next) => {
    getCorsHandler(req, res, next);
  },
  async (req, res) => {
    removeUnusedHeaders(req);
    await proxyRequest(req, res);
  }
);

app.post(
  '/stream',
  (req, res, next) => {
    getStreamHandler(req, res, next);
  },
  async (req, res) => {
    removeUnusedHeaders(req);
    console.log('req.headers', req.headers);
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      Host: 'hdrezka.ag',
      Origin: 'https://hdrezka.ag',
    };
    const body = {
      id: '66771',
      translator_id: '474',
      is_camrip: '0',
      is_ads: '0',
      is_director: '0',
      favs: '9c7a77c1-1ed6-462f-80dd-4ea478c1f18b',
      action: 'get_movie',
    };
    await proxyRequest(req, res, {
      method: 'POST',
      headers,
      body: new URLSearchParams(body),
    });
  }
);

var PORT = process.env.PORT || 8989;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
