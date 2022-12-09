import { User } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { expect, it, describe, afterEach, beforeEach } from 'vitest';
import { trpcRouter } from '../src/app';
import { createTestUser } from '../src/utils/test-helpers/data';
import { deleteGroups, deleteUsers } from '../src/utils/test-helpers/teardown';

describe('group.', () => {
  let testUser: User;
  let caller;
  let protectedCaller;
  const groupsToDelete = [];
  beforeEach(async () => {
    testUser = await createTestUser();
    caller = trpcRouter.createCaller({});
    protectedCaller = trpcRouter.createCaller({ uid: testUser.id });
  });

  afterEach(async () => {
    if (groupsToDelete.length > 0) {
      await deleteGroups(groupsToDelete);
    }
    await deleteUsers([testUser.id]);
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
      const response = await protectedCaller.group.create({
        name: 'test-group',
        description: 'test-group-description',
      });
      groupsToDelete.push(response.id);
      expect(response).toEqual(
        expect.objectContaining({
          name: 'test-group',
          description: 'test-group-description',
        })
      );
    });
  });
});
