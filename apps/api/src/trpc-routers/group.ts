import { TRPCError } from '@trpc/server';
import { createGroupValidator } from 'validations';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import {
  createGroup,
  getGroupForUser,
  getGroupsForUser,
  getGroupWithMembers,
  updateGroup,
} from '../utils/groups/queries';

export const groupRouter = router({
  forCurrentUser: protectedProcedure.query(({ ctx }) =>
    getGroupsForUser(ctx.uid)
  ),

  getById: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ input, ctx }) => {
      const group = await getGroupWithMembers(input.groupId, ctx.uid);
      if (!group) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }
      return group;
    }),

  update: protectedProcedure
    .input(
      createGroupValidator.partial().merge(z.object({ groupId: z.string() }))
    )
    .mutation(async ({ input, ctx }) => {
      const groupWithUserAsOwner = await getGroupForUser(
        input.groupId,
        ctx.uid,
        'owner'
      );
      if (!groupWithUserAsOwner) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const updatedGroup = await updateGroup(input);
      if (!updatedGroup) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }

      return updatedGroup;
    }),

  create: protectedProcedure
    .input(createGroupValidator)
    .mutation(async ({ ctx, input }) => createGroup(input, ctx.uid)),
});
