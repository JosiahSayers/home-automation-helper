import { CreateUserInput } from 'validations';
import { createSessionToken } from '../authentication/session';
import { db } from '../db';
import { logger } from '../logger';
import { encrypt } from './password';

export const createUser = async (data: CreateUserInput) => {
  try {
    const user = await db.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: await encrypt(data.password),
      }
    });
    const token = await createSessionToken(user.id);

    return { user, token};
  } catch (e) {
    logger.error(e, { msg: 'error creating user' });
    return null;
  }
};
