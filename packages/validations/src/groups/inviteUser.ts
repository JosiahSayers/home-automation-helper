import { z } from 'zod';

export const inviteUserToGroupValidator = z.object({
  email: z.string(),
});

export type InviteUserToGroupInput = z.infer<typeof inviteUserToGroupValidator>;
