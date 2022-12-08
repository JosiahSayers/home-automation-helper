import { TRPCError } from '@trpc/server';
import { middleware } from '../../trpc';
import { db } from '../../utils/db';

const isCorrectInput = (input: unknown): input is { groupId: string } =>
  typeof (input as any).groupId === 'string';

export const userCanManageGroup = middleware(async ({ next, ctx, input }) => {
  if (!isCorrectInput(input)) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'groupId is a required input',
    });
  }

  const groupWithUserAsOwner = await db.group.findFirst({
    where: {
      id: input.groupId,
      members: {
        some: {
          userId: ctx.uid!,
          membershipType: 'owner',
        },
      },
    },
  });

  if (!groupWithUserAsOwner) {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }

  return next({ ctx });
});
