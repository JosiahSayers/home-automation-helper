import { Group, GroupInvite, GroupInviteStatus, User } from '@prisma/client';
import { db } from '../db';
import { logger } from '../logger';
import { sendNotification } from '../notifications';
import {
  BasicResponse,
  FailedResponse,
  SuccessfulResponse,
} from '../routerUtils';
import { getGroupWithAllMemberAndUser } from './queries';

export const inviteUserToGroup = async (
  groupId: string,
  inviterId: string
): Promise<GroupInviteCreateResponse> => {
  try {
    const inviter = await db.user.findUnique({ where: { id: inviterId } });
    const group = await db.group.findFirst({
      where: {
        id: groupId,
        members: { some: { userId: inviterId, membershipType: 'owner' } },
      },
    });

    if (!inviter || !group) {
      logger.debug('Creating group invite failed, user or group not found', {
        inviter,
        group,
      });
      return {
        success: false,
        errorMessage: 'group not found',
        statusCode: 'NOT_FOUND',
      };
    }

    if (group.isPersonal) {
      logger.debug('User tried to create an invite for their personal group', {
        user: inviter,
        group,
      });
      return {
        success: false,
        errorMessage: 'Cannot invite users to a personal group',
        statusCode: 'FORBIDDEN',
      };
    }

    const invite = await db.groupInvite.create({
      data: {
        invitedById: inviter.id,
        groupId,
      },
    });

    return { success: true, invite };
  } catch (e) {
    logger.error(e, { msg: 'error creating group invite' });
    return {
      success: false,
      errorMessage: 'Unknown error',
      statusCode: 'INTERNAL_SERVER_ERROR',
    };
  }
};

export const respondToGroupInvite = async (
  inviteId: string,
  respondingUserId: string,
  action: GroupInviteStatus
): Promise<GroupInviteRespondResponse> => {
  const invite = await db.groupInvite.findUnique({ where: { id: inviteId } });
  if (!invite) {
    return {
      success: false,
      errorMessage: 'Invite not found',
      statusCode: 'NOT_FOUND',
    };
  }
  if (invite.invitedById === respondingUserId) {
    return {
      success: false,
      errorMessage: 'Not able to accept an invite that you initiated',
      statusCode: 'PRECONDITION_FAILED',
    };
  }
  if (invite.status !== 'pending') {
    return {
      success: false,
      errorMessage: 'This invite has already received a response',
      statusCode: 'PRECONDITION_FAILED',
    };
  }

  const group = await getGroupWithAllMemberAndUser(invite.groupId);
  const respondingUser = await db.user.findUnique({
    where: { id: respondingUserId },
  });

  if (!group || !respondingUser) {
    return {
      success: false,
      errorMessage: 'Unknown error',
      statusCode: 'INTERNAL_SERVER_ERROR',
    };
  }

  if (group.members.find((member) => member.userId === respondingUserId)) {
    return {
      success: false,
      errorMessage: 'User is already a member of this group',
      statusCode: 'PRECONDITION_FAILED',
    };
  }
  return action === 'accepted'
    ? acceptGroupInvite(invite, group, respondingUser)
    : rejectGroupInvite(invite, group, respondingUser);
};

const rejectGroupInvite = async (
  invite: GroupInvite,
  group: Group,
  rejectingUser: User
): Promise<GroupInviteRespondResponse> => {
  try {
    await db.groupInvite.update({
      where: { id: invite.id },
      data: {
        status: 'rejected',
        respondingUserId: rejectingUser.id,
      },
    });

    sendNotification(invite.invitedById, {
      notification: 'inviteRejected',
      rejectedBy: rejectingUser,
      group,
    });

    return { success: true };
  } catch (e) {
    logger.error(e, {
      msg: 'Error rejecting group invite',
      userId: rejectingUser.id,
      inviteId: invite.id,
    });

    return {
      success: false,
      errorMessage: 'Unknown error',
      statusCode: 'INTERNAL_SERVER_ERROR',
    };
  }
};

const acceptGroupInvite = async (
  invite: GroupInvite,
  group: GroupWithMembers,
  acceptingUser: User
): Promise<GroupInviteRespondResponse> => {
  try {
    await db.$transaction([
      db.groupMembers.create({
        data: {
          groupId: invite.groupId,
          userId: acceptingUser.id,
          membershipType: 'member',
        },
      }),
      db.groupInvite.update({
        where: { id: invite.id },
        data: {
          status: 'accepted',
          respondingUserId: acceptingUser.id,
        },
      }),
    ]);

    await Promise.all(
      group!.members.map((member) =>
        sendNotification(member.userId, {
          notification: 'inviteAccepted',
          acceptedBy: acceptingUser,
          group: group!,
        })
      )
    );

    return { success: true };
  } catch (e) {
    logger.error(e, {
      msg: 'Error accepting group invite',
      userId: acceptingUser.id,
      inviteId: invite.id,
    });
    return {
      success: false,
      errorMessage: 'Unknown error',
      statusCode: 'INTERNAL_SERVER_ERROR',
    };
  }
};

type GroupInviteRespondResponse = BasicResponse;

type GroupInviteCreateResponse =
  | (SuccessfulResponse & { invite: GroupInvite })
  | FailedResponse;

type GroupWithMembers = Awaited<
  ReturnType<typeof getGroupWithAllMemberAndUser>
>;
