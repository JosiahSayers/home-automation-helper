import { User } from '@prisma/client';
import { db } from '../db';
import { getGroupWithMembers } from './queries';

export const inviteUserToGroup = async (groupId: string, inviterId: string, inviteeEmail: string): Promise<boolean> => {
  const inviter = await db.user.findUnique({ where: { id: inviterId } });
  if (!inviter) {
    return false;
  }
  
  const invitee = await db.user.findUnique({ where: { email: inviteeEmail } });
  if (!invitee) {
    return inviteUserWithoutAccount(groupId, inviter, inviteeEmail);
  }

  const group = await getGroupWithMembers(groupId, inviterId);
  const userIsAlreadyInGroup = group?.members.some(member => member.userId === invitee.id);
  if (userIsAlreadyInGroup) {
    return true;
  }

  return inviteUserWithAccount(groupId, inviter, invitee);
};

const inviteUserWithoutAccount = async (groupId: string, inviter: User, inviteeEmail: string) => {
  const invite = await db.groupInvite.create({
    data: {
      groupId,
      invitedById: inviter.id,
      email: inviteeEmail
    }
  });
  // send email inviting user to create an account
  return true;
};

const inviteUserWithAccount = async (groupId: string, inviter: User, invitee: User) => {
  const invite = await db.groupInvite.create({
    data: {
      groupId,
      invitedById: inviter.id,
      userId: invitee.id,
    }
  });
  // send push notification about group invite if available
  // send email about group invite if push not available
  return true;
};
