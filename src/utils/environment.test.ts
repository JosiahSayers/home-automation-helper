import { expect, test } from 'vitest';
import { environment } from './environment';

test('returns values defined in .env file when not in production', () => {
  expect(environment.port()).toBe(3000);
});
