import { z } from 'zod';

export const createTaskValidator = z.object({
  name: z.string(),
  description: z.string().optional(),
  groupId: z.string().min(1),
});

export type CreateTaskInput = z.infer<typeof createTaskValidator>;
