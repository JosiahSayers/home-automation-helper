import { GroupInvite } from '@prisma/client';
import { db } from '../db';
import { logger } from '../logger';

export const inviteUserToGroup = async (
  groupId: string,
  inviterId: string
): Promise<GroupInvite | null> => {
  const inviter = await db.user.findUnique({ where: { id: inviterId } });
  const group = await db.group.findUnique({ where: { id: groupId } });
  if (!inviter || !group) {
    logger.debug('Creating group invite failed, user or group not found', {
      inviter,
      group,
    });
    return null;
  }
  return db.groupInvite.create({
    data: {
      invitedById: inviter.id,
      groupId,
    },
  });
};
