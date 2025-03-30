const redis = require('redis');
const config = require('config');

const client = redis.createClient(config.get('redis'));

client.on('error', (err) => console.log('Redis Client Error', err));
client.connect();

module.exports = {
  get: async (key) => {
    return await client.get(key);
  },
  set: async (key, value, ttlSeconds) => {
    await client.setEx(key, ttlSeconds, value);
  },
  route: (duration = 5) => async (req, res, next) => {
    const key = '__express__' + req.originalUrl || req.url;
    const cachedBody = await client.get(key);
    if (cachedBody) {
      res.send(cachedBody);
      return;
    } else {
      res.sendResponse = res.send;
      res.send = (body) => {
        client.setEx(key, duration, body);
        res.sendResponse(body);
      };
      next();
    }
  },
};