import logger from './logger';

export class RateLimiter {
  private lastCallTime: number = 0;
  private callCount: number = 0;

  constructor(
    private maxCalls: number,
    private perSeconds: number,
    private retryAfter: number = 60000,
  ) {}

  async limit<T>(fn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    if (now - this.lastCallTime > this.perSeconds * 1000) {
      this.callCount = 0;
      this.lastCallTime = now;
    }

    if (this.callCount >= this.maxCalls) {
      const waitTime = this.perSeconds * 1000 - (now - this.lastCallTime);
      logger.warn(`Rate limit exceeded. Waiting for ${waitTime}ms before retrying.`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      return this.limit(fn);
    }

    this.callCount++;

    try {
      return await fn();
    } catch (error) {
      const e = error as unknown as { response: { status: number } };
      if (e.response && e.response.status === 429) {
        logger.warn(`Received 429 Too Many Requests. Retrying after ${this.retryAfter}ms.`);
        await new Promise((resolve) => setTimeout(resolve, this.retryAfter));
        return this.limit(fn);
      }
      throw error;
    }
  }
}
