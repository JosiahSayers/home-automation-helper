import { expect, it, describe } from 'vitest';
import { environment } from '../src/utils/environment';

describe('GET /', () => {
  const url = `http://localhost:${environment.port()}/task`;

  it('returns a 401 response when the x-api-key header is missing', async () => {
    const res = await fetch(url);
    expect(res.status).toBe(401);
  });

  it('returns a 401 when the api key is not found', async () => {
    const res = await fetch(url, { headers: { 'x-api-key': 'invalid' } });
    expect(res.status).toBe(401);
  });
});
