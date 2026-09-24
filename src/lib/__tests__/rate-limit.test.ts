import { beforeEach, describe, expect, it } from '@jest/globals';
import { checkRateLimit, resetRateLimits } from '@/src/lib/rate-limit';
import { RateLimitError } from '@/src/lib/errors';

describe('checkRateLimit', () => {
  beforeEach(() => resetRateLimits());

  it('allows up to the limit then throws', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('ip', 5, 1000, 0);
    expect(() => checkRateLimit('ip', 5, 1000, 10)).toThrow(RateLimitError);
  });

  it('resets after the window', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('ip', 5, 1000, 0);
    expect(() => checkRateLimit('ip', 5, 1000, 1000)).not.toThrow();
  });

  it('tracks keys separately', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('a', 5, 1000, 0);
    expect(() => checkRateLimit('b', 5, 1000, 0)).not.toThrow();
  });
});
