import { Group, User } from '@prisma/client';
import { test, beforeAll, afterAll, expect } from 'vitest';
import { db } from '../db';
import { createUser } from '../users';
import { inviteUserToGroup } from './membership';
import { createGroup } from './queries';

let testUser: User;
let testGroup: Group;

beforeAll(async () => {
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

afterAll(async () => {
  await db.user.delete({ where: { id: testUser.id } });
  await db.groupMembers.deleteMany({ where: { groupId: testGroup.id } });
  await db.group.delete({ where: { id: testGroup.id } });
});

test('invite email not assigned to an account', async () => {
  const badEmail = `${new Date().getTime()}@unittest.com`;
  await inviteUserToGroup(testGroup.id, testUser.id, badEmail);
  const invite = await db.groupInvite.findUnique({
    where: {
      userId_email_groupId: {
        userId: '',
        groupId: testGroup.id,
        email: badEmail,
      },
    },
  });
  expect(invite).not.toBeNull();
});

// test('invite email assigned to an account', () => {});
