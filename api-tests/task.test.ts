import { Task, TaskType } from '@prisma/client';
import { expect, it, describe, afterAll, beforeEach } from 'vitest';
import { db } from '../src/utils/db';
import { environment } from '../src/utils/environment';

describe('/task', () => {
  const url = `http://localhost:${environment.port()}/task`;
  const tasksToCleanup: string[] = [];
  const headers = { 'x-api-key': 'valid', 'Content-Type': 'application/json' };
  let body: string;

  function createTask(completedBy = new Date().getTime().toString()) {
    tasksToCleanup.push(completedBy);
    body = JSON.stringify({ type: TaskType.putOutTrashCan, completedBy });
  }

  beforeEach(() => {
    createTask();
  });

  afterAll(async () => {
    await db.task.deleteMany({ where: { completedBy: { in: tasksToCleanup } } });
  });

  describe('POST /', () => {
    it('returns a 200 when consumer is allowed access', async () => {
      const res = await fetch(url, { method: 'post', headers, body });
      expect(res.status).toBe(200);
    });
  
    it.only('adds the task to the db', async () => {
      const res = await fetch(url, { method: 'post', headers, body });
      const inDb = await db.task.findFirst({ where: { completedBy: tasksToCleanup[tasksToCleanup.length - 1] } });
      expect(res.status).toBe(200);
      expect(inDb).toContain({
        completedBy: tasksToCleanup[tasksToCleanup.length - 1],
        type: TaskType.putOutTrashCan,
      });
    });
  });

  describe.only('GET /', () => {
    it('allows searching by type', async () => {
      const res = await fetch(`${url}?type=${TaskType.putOutTrashCan}`, { headers });
      const body: { results: Task[] } = await res.json();
      expect(body.results.every(t => t.type === TaskType.putOutTrashCan)).toBe(true);
    });

    it('allows searching by completed by', async () => {
      const res = await fetch(`${url}?completedBy=${tasksToCleanup.at(-1)}`, { headers });
      const body = await res.json();
      expect(body.results.every(t => t.completedBy === tasksToCleanup.at(-1))).toBe(true);
    });
  });
});
