import { User } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { expect, it, describe, beforeAll } from 'vitest';
import { trpcRouter } from '../src/app';
import { createTestUser } from '../src/utils/test-helpers/data';

describe('group.', () => {
  let testUser: User;
  let caller;
  let protectedCaller;
  beforeAll(async () => {
    testUser = await createTestUser();
    caller = trpcRouter.createCaller({});
    protectedCaller = trpcRouter.createCaller({ uid: testUser.id });
  });

  describe('create', () => {
    it('requires authentication', async () => {
      try {
        await caller.group.create({
          name: '',
          description: '',
        });
        expect(false).toBe(true);
      } catch (e) {
        expect(e).toBeInstanceOf(TRPCError);
      }
    });

    it('allows a user to create a group', async () => {
      const response = protectedCaller.group.create({
        name: 'test-group',
        description: 'test-group-description',
      });
      expect(response).toEqual(
        expect.objectContaining({
          name: 'test-group',
          description: 'test-group-description',
        })
      );
    });
  });
});
