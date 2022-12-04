import { z } from 'zod';

export const createUserValidator = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8),
});

export type CreateUserInput = z.infer<typeof createUserValidator>;
