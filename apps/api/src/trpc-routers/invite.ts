import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { inviteUserToGroup } from '../utils/groups/membership';

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
});
