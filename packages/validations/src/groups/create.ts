import { z } from 'zod';

export const createGroupValidator = z.object({
  name: z.string(),
  description: z.string().optional(),
});

export type CreateGroupInput = z.infer<typeof createGroupValidator>;
