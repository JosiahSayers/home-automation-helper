
import admin from 'firebase-admin';
import { environment } from '../environment';

const firebaseAdmin = admin.initializeApp({
  credential: admin.credential.cert(environment.firebaseAdminCredentials()),
});

export const firebaseAuth = firebaseAdmin.auth();
