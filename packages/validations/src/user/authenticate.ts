import { z } from 'zod';

export const authenticateUserValidator = z.object({
  email: z.string(),
  password: z.string(),
});

export type AuthenticateUserInput = z.infer<typeof authenticateUserValidator>;
