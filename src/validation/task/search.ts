import { TaskType } from '@prisma/client';
import * as yup from 'yup';

export const searchTaskValidator = yup.object({
  type: yup.mixed<TaskType>().oneOf(Object.values(TaskType)).optional(),
  completedBy: yup.string().optional(),
  after: yup.date().optional(),
  take: yup.number().default(10).optional(),
  skip: yup.number().default(0).optional(),
});
