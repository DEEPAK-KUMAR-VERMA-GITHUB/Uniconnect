import Redis from 'ioredis';
import { ErrorHandler } from './ErrorHandler.js';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
});

redis.on('error', (error) => {
  console.error('Redis Error:', error);
});

export const cache = {
  async get(key) {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis Get Error:', error);
      return null;
    }
  },

  async set(key, value, ttl = 3600) {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Redis Set Error:', error);
    }
  },

  async del(key) {
    try {
      await redis.del(key);
    } catch (error) {
      console.error('Redis Delete Error:', error);
    }
  }
};

// Cache middleware
export const cacheMiddleware = (ttl = 3600) => async (request, reply) => {
  const key = `${request.url}-${request.user._id}`;
  
  const cachedData = await cache.get(key);
  if (cachedData) {
    return reply.send(JSON.parse(cachedData));
  }
  
  reply.after(() => {
    cache.set(key, JSON.stringify(reply.send), ttl);
  });
};