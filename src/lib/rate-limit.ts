import { NextRequest } from "next/server";

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore: RateLimitStore = {};

/**
 * Simple rate limiting utility for OAuth endpoints
 * In production, use Redis or a dedicated rate limiting service
 */
export class RateLimiter {
  private static readonly DEFAULT_CONFIG: RateLimitConfig = {
    maxRequests: 10,
    windowMs: 15 * 60 * 1000, // 15 minutes
  };

  /**
   * Check if request is within rate limits
   */
  static checkRateLimit(
    request: NextRequest,
    config: Partial<RateLimitConfig> = {}
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    
    // Get client identifier (IP address)
    const clientId = this.getClientId(request);
    const now = Date.now();
    
    // Get or create rate limit entry
    let entry = rateLimitStore[clientId];
    
    if (!entry || now > entry.resetTime) {
      // Reset or create new entry
      entry = {
        count: 0,
        resetTime: now + finalConfig.windowMs,
      };
      rateLimitStore[clientId] = entry;
    }
    
    // Check if request is allowed
    const allowed = entry.count < finalConfig.maxRequests;
    
    if (allowed) {
      entry.count++;
    }
    
    return {
      allowed,
      remaining: Math.max(0, finalConfig.maxRequests - entry.count),
      resetTime: entry.resetTime,
    };
  }

  /**
   * Get client identifier (IP address)
   */
  private static getClientId(request: NextRequest): string {
    // Get IP from various headers (for different deployment scenarios)
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const cfConnectingIp = request.headers.get("cf-connecting-ip");
    
    const ip = cfConnectingIp || realIp || forwarded?.split(",")[0] || "unknown";
    
    return `rate_limit:${ip}`;
  }

  /**
   * Clean up expired entries (call periodically in production)
   */
  static cleanup(): void {
    const now = Date.now();
    
    Object.keys(rateLimitStore).forEach(key => {
      const entry = rateLimitStore[key];
      if (entry && entry.resetTime < now) {
        delete rateLimitStore[key];
      }
    });
  }
} 