import { GroupMembershipType } from '@prisma/client';
import { CreateGroupInput } from 'validations';
import { db } from '../db';

export const getGroupsForUser = async (
  userId: string,
  membershipType?: GroupMembershipType
) =>
  db.group.findMany({
    where: {
      members: {
        some: {
          userId,
          membershipType,
        },
      },
    },
  });

export const getGroupForUser = async (
  groupId: string,
  userId: string,
  membershipType?: GroupMembershipType
) =>
  db.group.findFirst({
    where: {
      id: groupId,
      members: {
        some: {
          userId,
          membershipType,
        },
      },
    },
  });

export const getGroupWithMembers = async (groupId: string, userId: string) =>
  db.group.findFirst({
    where: {
      id: groupId,
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      members: {
        select: {
          userId: true,
          membershipType: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      },
      tasks: {
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          notificationSettings: {
            select: {
              createdAt: true,
              updatedAt: true,
              schedule: true,
              dayOfMonth: true,
              dayOfWeek: true,
              hour: true,
              minute: true,
            },
          },
        },
      },
    },
  });

export const createGroup = async (input: CreateGroupInput, userId: string) =>
  db.group.create({
    data: {
      name: input.name,
      description: input.description,
      members: {
        create: {
          userId,
          membershipType: 'owner',
        },
      },
    },
  });

export const updateGroup = async (
  input: Partial<CreateGroupInput> & { groupId: string }
) => {
  return db.group.update({
    where: {
      id: input.groupId,
    },
    data: {
      name: input.name,
      description: input.description,
    },
  });
};

export const getGroupWithAllMemberAndUser = async (id: string) =>
  db.group.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: true,
        },
      },
    },
  });
