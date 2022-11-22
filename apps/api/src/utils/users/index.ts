import { CreateUserInput } from '../../validation/users/create';
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
    const {
      password,
      ...userForClient
    } = user;
    return userForClient;
  } catch (e) {
    logger.error(e, { msg: 'error creating user' });
    return null;
  }
};
