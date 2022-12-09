import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { protectedProcedure, publicProcedure, router } from '../trpc';
import {
  inviteUserToGroup,
  respondToGroupInvite,
} from '../utils/groups/membership';
import { getPublicInviteInfo } from '../utils/invites/queries';

export const inviteRouter = router({
  create: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invite = await inviteUserToGroup(input.groupId, ctx.uid);
      if (!invite) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
      return { invitedId: invite.id };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const invite = await getPublicInviteInfo(input.id);
      if (!invite) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }
      return invite;
    }),

  respond: protectedProcedure
    .input(
      z.object({ id: z.string(), action: z.enum(['accepted', 'rejected']) })
    )
    .mutation(async ({ ctx, input }) => {
      const inviteAcceptStatus = await respondToGroupInvite(
        input.id,
        ctx.uid,
        input.action
      );
      if (!inviteAcceptStatus.success) {
        throw new TRPCError({
          code: inviteAcceptStatus.statusCode,
          message: inviteAcceptStatus.errorMessage,
        });
      }
      return { success: true };
    }),
});
