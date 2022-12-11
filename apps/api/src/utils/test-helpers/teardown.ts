import { db } from '../db';

export const truncateDb = async () => {
  await db.taskCompletionRecord.deleteMany();
  await db.taskNotificationSettings.deleteMany();
  await db.task.deleteMany();
  await db.groupInvite.deleteMany();
  await db.groupMembers.deleteMany();
  await db.group.deleteMany();
  await db.user.deleteMany();
};

export const deleteGroups = async (ids: string[]) => {
  await db.groupMembers.deleteMany({
    where: { groupId: { in: ids } },
  });
  await db.group.deleteMany({ where: { id: { in: ids } } });
};

export const deleteUsers = async (ids: string[]) => {
  await db.groupMembers.deleteMany({
    where: { userId: { in: ids } },
  });
  await db.user.deleteMany({ where: { id: { in: ids } } });
};
