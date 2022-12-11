import { GroupInviteStatus } from '@prisma/client';
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
      const result = await inviteUserToGroup(input.groupId, ctx.uid);
      if (!result.success) {
        throw new TRPCError({
          code: result.statusCode,
          message: result.errorMessage,
        });
      }
      return { invitedId: result.invite.id };
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
      z.object({
        id: z.string(),
        action: z.enum([
          GroupInviteStatus.accepted,
          GroupInviteStatus.rejected,
        ]),
      })
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
