import express from 'express';
import cors from 'cors';
import { validateApiKey } from './middleware/validateApiKey';
import { healthRouter } from './routers/health';
import { taskRouter } from './routers/task';
import { environment } from './utils/environment';

export const getApp = async () => {  
  const app = express();
  environment.loadEnv();

  app.use(express.json());
  app.use(cors());

  app.use('/health', healthRouter);
  app.use(validateApiKey);
  app.use('/task', taskRouter);

  return app;
};
