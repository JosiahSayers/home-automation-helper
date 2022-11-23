import express from 'express';
import cors from 'cors';
import { validateApiKey } from './middleware/validateApiKey';
import { healthRouter } from './routers/health';
import { usersRouter } from './routers/users';
import { getUser } from './middleware/auth/jwt';
import { environment } from './utils/environment';

export const getApp = async () => {  
  const app = express();
  environment.loadEnv();

  app.use(express.json());
  app.use(cors());

  app.use('/health', healthRouter);
  app.use(getUser);
  app.use('/users', usersRouter);
  app.use(validateApiKey);

  return app;
};
