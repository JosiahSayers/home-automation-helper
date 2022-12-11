import { z } from 'zod';

const baseFields = {
  hour: z.number().min(0).max(24),
  minute: z.number().min(0).max(59),
  taskId: z.string(),
};

export const notificationSettingsValidator = z.discriminatedUnion('schedule', [
  z.object({ schedule: z.literal('daily'), ...baseFields }),
  z.object({
    schedule: z.literal('weekly'),
    dayOfWeek: z.number().min(1).max(7),
    ...baseFields,
  }),
  z.object({
    schedule: z.literal('monthly'),
    dayOfMonth: z.number().min(1).max(28),
    ...baseFields,
  }),
]);

export type NotificationSettingsInput = z.infer<
  typeof notificationSettingsValidator
>;
