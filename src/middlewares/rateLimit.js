import { FastifyRequest, FastifyReply } from "fastify";
import { AppError } from "../utils/ErrorHandler";

const rateLimit = new Map();
const WINDOW_SIZE = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100;

export const rateLimiter = async (request, reply) => {
  const ip = request.ip;
  const now = Date.now();

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, [now]);
    return;
  }

  const requests = rateLimit.get(ip).filter((time) => time > now - WINDOW_SIZE);
  requests.push(now);
  rateLimit.set(ip, requests);

  if (requests.length > MAX_REQUESTS) {
    throw new AppError("Too many requests", 429);
  }
};
