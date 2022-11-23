import { DecodedIdToken } from 'firebase-admin';

declare global {
  namespace Express {
    interface Request {
      jwt: DecodedIdToken;
    }
  }
}
