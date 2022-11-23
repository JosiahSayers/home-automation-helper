import * as dotenv from 'dotenv';
import { logger } from './logger';

export const environment = {
  loadEnv: () => {
    if (process.env.NODE_ENV !== 'production') {
      dotenv.config();
    }
    const requiredVariables = [
      'FIREBASE_ADMIN_CREDENTIALS'
    ];
    const missingVariables = requiredVariables.filter(envVar => !process.env[envVar]);
    if (missingVariables.length) {
      logger.error(`missing environment variables: ${missingVariables.join(', ')}`);
      process.exit(1);
    }
  },
  port: () => parseInt(process.env.PORT || '', 10) || 3000,
  testHost: () => process.env.TEST_HOST || 'http://localhost',
  validApiKeys: () => (process.env.API_KEYS || '').split(','),
  isProduction: () => process.env.NODE_ENV === 'production',
  firebaseAdminCredentials: () => JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS!),
  firebaseTestingKey: () => process.env.FIREBASE_TESTING_API_KEY!,
};