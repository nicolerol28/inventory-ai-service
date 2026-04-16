/**
 * In-memory sliding-window rate limiter per user.
 * Protects Gemini free-tier quota.
 */
export class RateLimiter {
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private readonly requests = new Map<string, number[]>();

  constructor(windowMs = 60_000, maxRequests = 10) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Cleanup stale entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60_000).unref();
  }

  /**
   * Check if the user can make a request.
   * Returns { allowed, remaining, retryAfterMs }
   */
  check(userId: string): {
    allowed: boolean;
    remaining: number;
    retryAfterMs: number;
  } {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    let timestamps = this.requests.get(userId) ?? [];
    timestamps = timestamps.filter((t) => t > windowStart);

    if (timestamps.length >= this.maxRequests) {
      const oldest = timestamps[0]!;
      const retryAfterMs = oldest + this.windowMs - now;
      return {
        allowed: false,
        remaining: 0,
        retryAfterMs: Math.max(retryAfterMs, 0),
      };
    }

    timestamps.push(now);
    this.requests.set(userId, timestamps);

    return {
      allowed: true,
      remaining: this.maxRequests - timestamps.length,
      retryAfterMs: 0,
    };
  }

  private cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [userId, timestamps] of this.requests) {
      const active = timestamps.filter((t) => t > windowStart);
      if (active.length === 0) {
        this.requests.delete(userId);
      } else {
        this.requests.set(userId, active);
      }
    }
  }
}

// Singleton: 10 requests per minute per user
export const rateLimiter = new RateLimiter(60_000, 10);