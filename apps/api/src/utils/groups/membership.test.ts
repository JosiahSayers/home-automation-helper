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
    }))!.user;
    testGroup = (await createGroup(
      {
        description: 'group created for unit test',
        name: time.toString(),
      },
      testUser.id
    ))!;
  });

  test('when email is not used by any existing users', async () => {
    const badEmail = `${new Date().getTime()}@unittest.com`;
    await inviteUserToGroup(testGroup.id, testUser.id, badEmail);
    const invite = await db.groupInvite.findFirst({
      where: {
        email: badEmail,
      },
    });
    expect(invite).not.toBeNull();
    expect(invite?.email).toBe(badEmail);
    expect(invite?.groupId).toBe(testGroup.id);
    expect(invite?.invitedById).toBe(testUser.id);
    expect(invite?.userId).toBeNull();
  });

  test('whem email is in use by an existing user', async () => {
    const email = `${new Date().getTime()}@unittest.com`;
    const { user } = (await createUser({
      email,
      name: 'new user for test',
      password: 'password',
    }))!;
    await inviteUserToGroup(testGroup.id, testUser.id, email);
    const invite = await db.groupInvite.findFirst({
      where: {
        userId: user.id,
        groupId: testGroup.id,
      },
    });
    expect(invite).toBeTruthy();
    expect(invite?.email).toBeFalsy();
    expect(invite?.groupId).toBe(testGroup.id);
    expect(invite?.invitedById).toBe(testUser.id);
    expect(invite?.userId).toBe(user.id);
  });
});
