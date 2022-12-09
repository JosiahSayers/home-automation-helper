import { User } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { expect, it, describe, afterEach, beforeEach } from 'vitest';
import { trpcRouter } from '../src/app';
import { db } from '../src/utils/db';
import { createGroup } from '../src/utils/groups/queries';
import { createTestUser } from '../src/utils/test-helpers/data';
import { deleteGroups, deleteUsers } from '../src/utils/test-helpers/teardown';

describe('group.', () => {
  let testUser: User;
  let caller;
  let protectedCaller;
  const groupsToDelete = [];
  const usersToDelete = [];
  beforeEach(async () => {
    testUser = await createTestUser();
    caller = trpcRouter.createCaller({});
    protectedCaller = trpcRouter.createCaller({ uid: testUser.id });
  });

  afterEach(async () => {
    if (groupsToDelete.length > 0) {
      await deleteGroups(groupsToDelete);
    }
    await deleteUsers([testUser.id, ...usersToDelete]);
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
        expect(e.code).toBe('UNAUTHORIZED');
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

  describe('forCurrentUser', () => {
    it('requires authentication', async () => {
      try {
        await caller.group.forCurrentUser();
        expect(false).toBe(true);
      } catch (e) {
        expect(e).toBeInstanceOf(TRPCError);
        expect(e.code).toBe('UNAUTHORIZED');
      }
    });

    it('returns an empty array when the user is not a member of any groups', async () => {
      const response = await protectedCaller.group.forCurrentUser();
      expect(response).toEqual([]);
    });

    it('returns the groups that the user is a member of', async () => {
      const ownerGroup = await createGroup(
        { name: 'test owner group' },
        testUser.id
      );
      groupsToDelete.push(ownerGroup.id);
      const otherUser = await createTestUser();
      usersToDelete.push(otherUser.id);
      const nonOwnerGroup = await createGroup(
        { name: 'test non-owner group' },
        otherUser.id
      );
      groupsToDelete.push(nonOwnerGroup.id);
      await db.groupMembers.create({
        data: {
          groupId: nonOwnerGroup.id,
          userId: testUser.id,
          membershipType: 'member',
        },
      });

      const response = await protectedCaller.group.forCurrentUser();
      expect(response.length).toBe(2);
      expect(response.find((g) => g.id === ownerGroup.id)).toBeDefined();
      expect(response.find((g) => g.id === nonOwnerGroup.id)).toBeDefined();
    });
  });

  describe('getById', () => {
    it('requires authentication', async () => {
      try {
        await caller.group.getById({
          groupId: 'test-group-id',
        });
        expect(false).toBe(true);
      } catch (e) {
        expect(e).toBeInstanceOf(TRPCError);
        expect(e.code).toBe('UNAUTHORIZED');
      }
    });

    it('throws an error when the group ID is not found', async () => {
      try {
        await protectedCaller.group.getById({
          groupId: 'test-group-id',
        });
        expect(false).toBe(true);
      } catch (e) {
        expect(e).toBeInstanceOf(TRPCError);
        expect(e.code).toBe('NOT_FOUND');
      }
    });

    it('throws an error when the group exists but the calling user is not a member', async () => {
      try {
        const group = await createGroup({ name: 'test-group' }, testUser.id);
        groupsToDelete.push(group.id);
        await db.groupMembers.deleteMany({
          where: { groupId: group.id, userId: testUser.id },
        });
        await protectedCaller.group.getById({
          groupId: group.id,
        });
        expect(false).toBe(true);
      } catch (e) {
        expect(e).toBeInstanceOf(TRPCError);
        expect(e.code).toBe('NOT_FOUND');
      }
    });

    it('returns the group when it is found and the calling user is a member', async () => {
      const group = await createGroup({ name: 'test-group' }, testUser.id);
      groupsToDelete.push(group.id);
      const response = await protectedCaller.group.getById({
        groupId: group.id,
      });
      expect(response).toEqual(
        expect.objectContaining({
          id: group.id,
          name: group.name,
          description: group.description,
          members: [
            {
              userId: testUser.id,
              membershipType: 'owner',
              user: {
                name: testUser.name,
              },
            },
          ],
        })
      );
    });
  });

  describe.only('update', () => {
    it('requires authentication', async () => {
      try {
        await caller.group.update({
          groupId: '',
        });
        expect(false).toBe(true);
      } catch (e) {
        expect(e).toBeInstanceOf(TRPCError);
        expect(e.code).toBe('UNAUTHORIZED');
      }
    });

    it('returns an error when the user is not a group owner', async () => {
      const group = await createGroup({ name: 'test group' }, testUser.id);
      groupsToDelete.push(group.id);
      try {
        await db.groupMembers.updateMany({
          where: { groupId: group.id, userId: testUser.id },
          data: { membershipType: 'member' },
        });
        await protectedCaller.group.update({
          groupId: group.id,
          name: 'updated name',
        });
        expect(false).toBe(true);
      } catch (e) {
        expect(e).toBeInstanceOf(TRPCError);
        expect(e.code).toBe('FORBIDDEN');
        const groupAfterCall = await db.group.findUnique({
          where: { id: group.id },
        });
        expect(groupAfterCall.name).toBe('test group');
      }
    });

    it('allows owners to update a group', async () => {
      const group = await createGroup(
        { name: 'test group', description: 'test description' },
        testUser.id
      );
      groupsToDelete.push(group.id);
      await protectedCaller.group.update({
        groupId: group.id,
        name: 'updated name',
        description: 'updated description',
      });
      const groupAfterUpdate = await db.group.findUnique({
        where: { id: group.id },
      });
      expect(groupAfterUpdate.name).toBe('updated name');
      expect(groupAfterUpdate.description).toBe('updated description');
    });
  });
});
