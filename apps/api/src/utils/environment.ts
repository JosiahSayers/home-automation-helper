import * as dotenv from 'dotenv';
import { logger } from './logger';

export const environment = {
  loadEnv: () => {
    if (process.env.NODE_ENV !== 'production') {
      dotenv.config();
    }
    const requiredVariables: string[] = ['DATABASE_URL'];
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
  testHost: () => process.env.TEST_HOST || 'http://localhost',
  isProduction: () => process.env.NODE_ENV === 'production',
};
