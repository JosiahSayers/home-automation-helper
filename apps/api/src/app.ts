import express from 'express';
import cors from 'cors';
import * as trpcExpress from '@trpc/server/adapters/express';
import { healthRouter } from './routers/health';
import { getUser } from './middleware/auth/jwt';
import { environment } from './utils/environment';
import { groupsRouter } from './routers/groups';
import { cacheExistingSigningKeys } from './utils/authentication/session';
import { groupInviteRouter } from './routers/groupInvites';
import { router } from './trpc';
import { userRouter } from './procedures/user';
import { createContext } from './context';

export const trpcRouter = router({
  user: userRouter,
});

export type AppRouter = typeof trpcRouter;

export const getApp = async () => {
  const app = express();
  environment.loadEnv();
  await cacheExistingSigningKeys();

  app.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
      router: trpcRouter,
      createContext,
    })
  );

  app.use(express.json());
  app.use(cors());

  app.use('/health', healthRouter);
  app.use(getUser);
  app.use('/groups', groupsRouter);
  app.use('/groups/invites', groupInviteRouter);

  return app;
};
