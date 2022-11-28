import { db } from '../db';

export const truncateDb = async () => {
  await db.task.deleteMany();
  await db.taskType.deleteMany();
  await db.groupInvite.deleteMany();
  await db.groupMembers.deleteMany();
  await db.group.deleteMany();
  await db.user.deleteMany();
};
