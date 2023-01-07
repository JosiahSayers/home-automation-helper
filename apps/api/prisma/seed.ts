import { db } from '../src/utils/db';
import { encrypt } from '../src/utils/users/password';

const seed = async () => {
  const userData = {
    name: 'John Doe',
    email: 'test@test.com',
    password: await encrypt('password'),
  };
  await db.user.upsert({
    where: { email: 'test@test.com' },
    create: userData,
    update: userData,
  });
};

seed();
