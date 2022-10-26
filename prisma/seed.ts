import { TaskType } from '@prisma/client';
import { db } from '../src/utils/db';

const seed = async () => {
  const localDevData = {
    completedBy: 'test user',
    type: TaskType.takeInTrashCan,
  };
  await db.task.upsert({
    where: {
      id: 1,
    },
    create: localDevData,
    update: localDevData,
  });
};

seed();
