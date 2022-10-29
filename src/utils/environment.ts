import * as dotenv from 'dotenv';

export const environment = {
  loadEnv: () => {
    if (process.env.NODE_ENV !== 'production') {
      dotenv.config();
    }
  },
  port: () => parseInt(process.env.PORT || '', 10) || 3000,
  testHost: () => process.env.TEST_HOST || 'http://localhost',
  validApiKeys: () => (process.env.API_KEYS || '').split(','),
};
