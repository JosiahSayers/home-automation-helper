import * as dotenv from 'dotenv';
import { ConnectionOptions } from 'node-resque';
import { logger } from './logger';

export const environment = {
  loadEnv: () => {
    if (process.env.NODE_ENV !== 'production') {
      dotenv.config();
    }
    const requiredVariables: string[] = [
      'DATABASE_URL',
      'REDIS_HOST',
      'REDIS_PORT',
    ];
    const missingVariables = requiredVariables.filter(
      (envVar) => !process.env[envVar]
    );
    if (missingVariables.length) {
      logger.error(
        `missing environment variables: ${missingVariables.join(', ')}`
      );
      process.exit(1);
    }
  },
  port: () => parseInt(process.env.PORT || '', 10) || 3000,
  redisOptions: (): ConnectionOptions => ({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT!),
    options: {
      password: process.env.REDIS_PASSWORD,
    },
  }),
  testHost: () => process.env.TEST_HOST || 'http://localhost',
  isProduction: () => process.env.NODE_ENV === 'production',
};
