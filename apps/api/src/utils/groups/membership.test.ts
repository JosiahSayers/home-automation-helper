import { Group, User } from '@prisma/client';
import { test, expect, beforeEach, describe } from 'vitest';
import { db } from '../db';
import { truncateDb } from '../test-helpers/teardown';
import { createUser } from '../users';
import { inviteUserToGroup } from './membership';
import { createGroup } from './queries';

let testUser: User;
let testGroup: Group;

describe('inviteUserToGroup', () => {
  beforeEach(async () => {
    await truncateDb();
    const time = new Date().getTime();
    testUser = (await createUser({
      name: 'Unit Test User',
      email: `${time}@test.com`,
      password: 'password',
    }))!;
    testGroup = (await createGroup(
      {
        description: 'group created for unit test',
        name: time.toString(),
      },
      testUser.id
    ))!;
  });

  test('does not create an invite when the invitedId is not valid', async () => {
    const response = await inviteUserToGroup(testGroup.id, 'invalid user id');
    expect(response).toBeNull();
  });

  test('does not create an invite when the groupId is not valid', async () => {
    const response = await inviteUserToGroup('invalid group id', testUser.id);
    expect(response).toBeNull();
  });

  test('creates and returns an invite', async () => {
    const response = await inviteUserToGroup(testGroup.id, testUser.id);
    const inviteFromDb = await db.groupInvite.findUnique({
      where: { id: response?.id },
    });
    expect(response).not.toBeNull();
    expect(inviteFromDb).not.toBeNull();
    expect(response).toEqual(inviteFromDb);
  });
});
