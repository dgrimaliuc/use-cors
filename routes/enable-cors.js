const express = require('express');
const { getCorsHandler, getStreamHandler } = require('../lib/handlers.js');
const { proxyRequest } = require('../lib/utils.js');
const cors = require('cors');

const router = express.Router();

router.use(
  cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept',
    credentials: true,
  })
);

router.post(
  '/',
  (req, res, next) => {
    getCorsHandler(req, res, next);
  },
  async (req, res) => {
    await proxyRequest(req, res);
  }
);

router.post(
  '/stream',
  (req, res, next) => {
    getStreamHandler(req, res, next);
  },
  async (req, res) => {
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

module.exports = router;
