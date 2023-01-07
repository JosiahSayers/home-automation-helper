import { expect, it, describe } from 'vitest';
import { environment } from '../src/utils/environment';

describe('GET /', () => {
  it('returns a 200 response with the correct JSON data', async () => {
    const res = await fetch(
      `http://${environment.testHost()}:${environment.port()}/health`
    );
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toEqual({
      up: true,
      dbConnected: true,
    });
  });
});
