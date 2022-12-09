import { db } from '../db';

export const getPublicInviteInfo = async (id: string) =>
  db.groupInvite.findUnique({
    where: { id },
    select: {
      status: true,
      createdAt: true,
      invitedBy: {
        select: {
          name: true,
        },
      },
      group: {
        select: {
          name: true,
        },
      },
    },
  });
