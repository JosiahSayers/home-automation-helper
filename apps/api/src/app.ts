import express from 'express';
import cors from 'cors';
import * as trpcExpress from '@trpc/server/adapters/express';
import { healthRouter } from './routers/health';
import { environment } from './utils/environment';
import { cacheExistingSigningKeys } from './utils/authentication/session';
import { router } from './trpc';
import { userRouter } from './trpc-routers/user';
import { createContext } from './context';
import { groupRouter } from './trpc-routers/group';
import { inviteRouter } from './trpc-routers/invite';

export const trpcRouter = router({
  user: userRouter,
  group: groupRouter,
  invite: inviteRouter,
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

  return app;
};
