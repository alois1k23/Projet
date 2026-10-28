/**
 * Limiteur en mémoire à fenêtre fixe. Suffisant pour une seule instance ;
 * à remplacer par un stockage partagé (Redis, Postgres) en cas de mise à l’échelle.
 */
export class RateLimiter {
  private hits = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly now: () => number = Date.now,
  ) {}

  /** Enregistre une tentative et indique si elle est autorisée. */
  attempt(key: string): { allowed: boolean; retryAfterMs: number } {
    const t = this.now();
    const entry = this.hits.get(key);
    if (!entry || entry.resetAt <= t) {
      this.hits.set(key, { count: 1, resetAt: t + this.windowMs });
      return { allowed: true, retryAfterMs: 0 };
    }
    entry.count += 1;
    return entry.count <= this.limit
      ? { allowed: true, retryAfterMs: 0 }
      : { allowed: false, retryAfterMs: entry.resetAt - t };
  }

  reset(key: string) {
    this.hits.delete(key);
  }
}

export const loginLimiter = new RateLimiter(10, 15 * 60 * 1000);
export const analysisLimiter = new RateLimiter(30, 60 * 60 * 1000);
export const mailLimiter = new RateLimiter(5, 60 * 60 * 1000);
export const demoLimiter = new RateLimiter(10, 60 * 60 * 1000);
