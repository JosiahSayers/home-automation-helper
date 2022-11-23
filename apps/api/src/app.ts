import express from 'express';
import cors from 'cors';
import { healthRouter } from './routers/health';
import { usersRouter } from './routers/users';
import { getUser } from './middleware/auth/jwt';
import { environment } from './utils/environment';
import { groupsRouter } from './routers/groups';
import { cacheExistingSigningKeys } from './utils/authentication/session';

export const getApp = async () => {  
  const app = express();
  environment.loadEnv();
  await cacheExistingSigningKeys();

  app.use(express.json());
  app.use(cors());

  app.use('/health', healthRouter);
  app.use('/users', usersRouter);
  app.use(getUser);
  app.use('/groups', groupsRouter);

  return app;
};
