import { z } from 'zod';
import { validateBody } from '../../middleware/validateBody';

export const createUserValidator = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8)
});

validateBody(createUserValidator);

export type CreateUserInput = z.infer<typeof createUserValidator>;
