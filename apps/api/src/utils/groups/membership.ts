import { GroupInvite } from '@prisma/client';
import { db } from '../db';
import { logger } from '../logger';
import { sendNotification } from '../notifications';

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

export const acceptGroupInvite = async (
  inviteId: string,
  acceptingUserId: string
): Promise<GroupAcceptResponse> => {
  const invite = await db.groupInvite.findUnique({
    where: { id: inviteId },
  });
  if (!invite) {
    return {
      success: false,
      errorMessage: 'Invite not found',
      httpStatusCode: 404,
    };
  }
  if (invite.invitedById === acceptingUserId) {
    return {
      success: false,
      errorMessage: 'Not able to accept an invite that you initiated',
      httpStatusCode: 422,
    };
  }

  const group = await db.group.findUnique({
    where: { id: invite.groupId },
    include: {
      members: {
        include: {
          user: true,
        },
      },
    },
  });

  if (group?.members.find((member) => member.userId === acceptingUserId)) {
    return {
      success: false,
      errorMessage: 'User is already a member of this group',
      httpStatusCode: 422,
    };
  }

  await db.$transaction([
    db.groupMembers.create({
      data: {
        groupId: invite.groupId,
        userId: acceptingUserId,
        membershipType: 'member',
      },
    }),
    db.groupInvite.update({
      where: { id: invite.id },
      data: {
        status: 'accepted',
        acceptedById: acceptingUserId,
      },
    }),
  ]);

  await Promise.all(
    group!.members.map((member) =>
      sendNotification('inviteAccepted', {
        acceptedBy: member.user,
        group: group!,
      })
    )
  );

  return { success: true };
};

interface SuccessfulGroupAccept {
  success: true;
  errorMessage?: undefined;
  httpStatusCode?: undefined;
}

interface FailedGroupAccept {
  success: false;
  errorMessage: string;
  httpStatusCode: number;
}

type GroupAcceptResponse = SuccessfulGroupAccept | FailedGroupAccept;
