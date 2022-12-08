import * as t from '@trpc/server';
import { protectedProcedure, publicProcedure, router } from '../trpc';
import { db } from '../utils/db';
import { authenticateUserValidator, createUserValidator } from 'validations';
import { doPasswordsMatch, encrypt } from '../utils/users/password';
import { createSessionToken } from '../utils/authentication/session';
import { clientSafeUser } from '../utils/users';
import { logger } from '../utils/logger';

export const userRouter = router({
  current: protectedProcedure.query(async ({ ctx }) => {
    const user = await db.user.findUnique({
      where: { id: ctx.uid },
    });
    return clientSafeUser(user);
  }),
  authenticate: publicProcedure
    .input(authenticateUserValidator)
    .mutation(async ({ input }) => {
      const authError = new t.TRPCError({ code: 'UNAUTHORIZED' });
      const user = await db.user.findUnique({ where: { email: input.email } });
      if (!user) {
        throw authError;
      }

      const passwordsMatch = await doPasswordsMatch(
        input.password,
        user.password
      );
      if (!passwordsMatch) {
        throw authError;
      }

      const token = await createSessionToken(user.id);
      return { token };
    }),
  register: publicProcedure
    .input(createUserValidator)
    .mutation(async ({ input }) => {
      try {
        const user = await db.user.create({
          data: {
            email: input.email,
            name: input.name,
            password: await encrypt(input.password),
          },
        });

        return clientSafeUser(user);
      } catch (e) {
        logger.error(e, { msg: 'error creating user' });
        throw new t.TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
    }),
});
