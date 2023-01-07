import { TRPCError } from '@trpc/server';
import {
  createTaskValidator,
  notificationSettingsValidator,
} from 'validations';
import { protectedProcedure, router } from '../trpc';
import { createTask, setNotificationSettings } from '../utils/tasks';

export const taskRouter = router({
  create: protectedProcedure
    .input(createTaskValidator)
    .mutation(async ({ ctx, input }) => {
      const task = await createTask(ctx.uid, input);
      if (!task) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
      return task;
    }),

  setNotification: protectedProcedure
    .input(notificationSettingsValidator)
    .mutation(async ({ ctx, input }) => {
      const output = await setNotificationSettings(ctx.uid, input);
      if (!output.success) {
        throw new TRPCError({
          code: output.statusCode,
          message: output.errorMessage,
        });
      }
      return { success: true };
    }),
});
