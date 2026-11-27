import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let redisInstance: Redis | null = null;
let contactRatelimitInstance: Ratelimit | null = null;
let blogActionRatelimitInstance: Ratelimit | null = null;
let viewRatelimitInstance: Ratelimit | null = null;
let analyticsCollectRatelimitInstance: Ratelimit | null = null;

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  redisInstance ??= new Redis({ url, token });
  return redisInstance;
}

/**
 * Shared Redis client for server-side deduplication and caching.
 */
export function getRedisClient(): Redis | null {
  return getRedis();
}

/**
 * Rate limiter for the contact form: 3 submissions per hour per IP.
 */
export function getContactRatelimit(): Ratelimit | null {
  const redis = getRedis();
  if (!redis) {
    return null;
  }

  contactRatelimitInstance ??= new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 h"),
    analytics: true,
    prefix: "@ehs/contact",
  });

  return contactRatelimitInstance;
}

/**
 * Rate limiter for admin blog write actions: 10 operations per minute per user.
 */
export function getBlogActionRatelimit(): Ratelimit | null {
  const redis = getRedis();
  if (!redis) {
    return null;
  }

  blogActionRatelimitInstance ??= new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    analytics: true,
    prefix: "@ehs/blog-admin",
  });

  return blogActionRatelimitInstance;
}

/**
 * Rate limiter for public blog post view increments: 5 requests per 10 minutes per IP+post.
 */
export function getViewRatelimit(): Ratelimit | null {
  const redis = getRedis();
  if (!redis) {
    return null;
  }

  viewRatelimitInstance ??= new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "10 m"),
    analytics: false,
    prefix: "@ehs/blog-views",
  });

  return viewRatelimitInstance;
}

/**
 * Rate limiter for first-party article analytics beacons: 60 requests per minute per IP.
 */
export function getAnalyticsCollectRatelimit(): Ratelimit | null {
  const redis = getRedis();
  if (!redis) {
    return null;
  }

  analyticsCollectRatelimitInstance ??= new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "1 m"),
    analytics: false,
    prefix: "@ehs/analytics-collect",
  });

  return analyticsCollectRatelimitInstance;
}
