import { afterEach, expect, vi, test } from 'vitest';
import { doPasswordsMatch, encrypt } from './password';
import bcrypt from 'bcryptjs';

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('HASHED PASSWORD'),
    compare: vi.fn().mockResolvedValue(true),
  }
}));

afterEach(() => {
  vi.clearAllMocks();
});

test('encrypt returns the result of brcypt.hash', async () => {
  expect(await encrypt('test pass')).toBe('HASHED PASSWORD');
  expect(bcrypt.hash).toHaveBeenCalledWith('test pass', 10);
});

test('doPasswordsMatch returns the result of bcrypt.compare', async () => {
  expect(await doPasswordsMatch('test pass', 'test hashed pass')).toBe(true);
  expect(bcrypt.compare).toHaveBeenCalledWith('test pass', 'test hashed pass');
});
