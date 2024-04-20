const SECONDS = 10000000;
jest.setTimeout(10 * SECONDS);


const headers = {
  'Content-Length': '120',
  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  Host: 'hdrezka.ag',
  Origin: 'https://hdrezka.ag',
  'sec-ch-ua':
    '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
  'User-Agent': 'PostmanRuntime/7.37.3',
  Accept: '*/*',
  'Postman-Token': '1ca9dffc-37d9-4b53-aeb3-a218e7ec930f',
  'Accept-Encoding': 'gzip, deflate, br',
  Cookie:
    'PHPSESSID=ass9l1g672t97ke3r600ccr0so; dle_user_taken=1; dle_user_token=715f5979801772f0de3ee5670696cb53',
};

const body = {
  id: '66771',
  translator_id: '474',
  is_camrip: '0',
  is_ads: '0',
  is_director: '0',
  favs: '9c7a77c1-1ed6-462f-80dd-4ea478c1f18b',
  action: 'get_movie',
  url: 'https://hdrezka.ag/ajax/get_cdn_series/?t=1713247286067',
};

test('Hhdrezka test', async () => {
  const re = await fetch(
    'https://hdrezka.ag/ajax/get_cdn_series/?t=1713247286067',
    {
      method: 'POST',
      headers,
      body: new URLSearchParams(body),
    }
  );
  console.log(await re.json());
});

test('stream localhost test', async () => {
  const re = await fetch('http://localhost:3000/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  console.log(await re.text());
});

test('localhost test endpoint', async () => {
  const re = await fetch('http://localhost:3000/test', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  console.log(await re.text());
});
