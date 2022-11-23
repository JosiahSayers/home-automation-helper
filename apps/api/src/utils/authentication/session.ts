import { SigningKey } from '@prisma/client';
import { generateKeyPair } from 'crypto';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import { db } from '../db';
import { logger } from '../logger';

const cachedKeys: Map<string, SigningKey> = new Map();

export const verifyToken = (token: string): string | null => {
  let output = null;
  jwt.verify(token, (header, callback) => {
    const cachedKey = cachedKeys.get(header.kid!);
    if (!cachedKey) {
      return callback(new JsonWebTokenError('kid not found'));
    }
    return callback(null, cachedKey.publicKey);
  }, { algorithms: ['RS256'] }, (err, decodedToken) => {
    if (err) {
      logger.error(err as any, { msg: 'Unable to verify jwt' });
      return;
    }
    output = (decodedToken as any).uid;
    return;
  });
  return output;
};

export const createSessionToken = async (userId: string): Promise<string> => {
  const currentKey = await getCurrentSigningKey();
  return jwt.sign(
    { uid: userId },
    currentKey.privateKey,
    { algorithm: 'RS256', keyid: currentKey.id, expiresIn: '6h' },
  );
};

const getCurrentSigningKey = async (): Promise<SigningKey> => {
  const asArray = [...cachedKeys.values()];
  asArray.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  const sixHours = 6 * 60 * 60 * 1000;
  const currentKey = asArray.find(key => key.expiresAt.getTime() > new Date().getTime() + sixHours);
  if (!currentKey) {
    return createSigningKey();
  }
  return currentKey;
};

const createSigningKey = async (): Promise<SigningKey> => {
  const signingKey = await db.signingKey.create({
    data: await newKeyPair(),
  });
  cachedKeys.set(signingKey.id, signingKey);
  removeExpiredKeysFromCache();
  return signingKey;
};

const newKeyPair = async (): Promise<{ publicKey: string, privateKey: string }> => {
  return new Promise((res, rej) => {
    generateKeyPair('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      }},
    (err, publicKey, privateKey) => {
      if (err) {
        logger.error(err as any, { msg: 'Error generating new key pair' });
        return rej(err);
      }
      res({ publicKey, privateKey });
    }
    );
  });
};

const removeExpiredKeysFromCache = () => {
  const asArray = [...cachedKeys.values()];
  asArray.forEach(key => {
    if (key.expiresAt.getTime() < new Date().getTime()) {
      cachedKeys.delete(key.id);
    }
  });
};

export const cacheExistingSigningKeys = async (): Promise<void> => {
  const currentlyValidKeys = await db.signingKey.findMany({
    where: {
      expiresAt: {
        gt: new Date()
      }
    }
  });
  currentlyValidKeys.forEach(key => cachedKeys.set(key.id, key));

  if (currentlyValidKeys.length === 0) {
    const newKey = await createSigningKey();
    cachedKeys.set(newKey.id, newKey);
  }
};
