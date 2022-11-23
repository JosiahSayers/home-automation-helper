import { CreateGroupInput } from 'validations';
import { db } from '../db';

export const getGroupsForUser = async (userId: string) =>
  db.group.findMany({
    where: {
      members: {
        some: {
          userId,
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
  groupId: string,
  input: Partial<CreateGroupInput>,
) => {
  return db.group.update({
    where: {
      id: groupId,
    },
    data: {
      name: input.name,
      description: input.description,
    },
  });
};
