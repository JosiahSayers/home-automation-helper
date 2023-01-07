import { User } from '@prisma/client';
import { db } from '../db';
import { encrypt } from '../users/password';

const currentTime = () => new Date().getTime();

export const createTestUser = async (data?: Partial<User>) =>
  db.user.create({
    data: {
      email: data?.email ?? `${currentTime()}@test.com`,
      password: await encrypt(data?.password ?? 'password'),
      name: data?.name ?? currentTime().toString(),
    },
  });
