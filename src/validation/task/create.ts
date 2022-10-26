import { TaskType } from '@prisma/client';
import * as yup from 'yup';

export const createTaskValidator = yup.object({
  type: yup.mixed<TaskType>().oneOf(Object.values(TaskType)).required(),
  completedBy: yup.string().required(),
});
