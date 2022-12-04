import { User } from '@prisma/client';
import { CreateUserInput } from 'validations';
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
      },
    });

    return user;
  } catch (e) {
    logger.error(e, { msg: 'error creating user' });
    return null;
  }
};

export const clientSafeUser = (user: User | null) => {
  if (!user) {
    return null;
  }

  const { password, ...rest } = user;
  return rest;
};
