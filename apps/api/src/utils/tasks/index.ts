import { CreateTaskInput, NotificationSettingsInput } from 'validations';
import { db } from '../db';
import { logger } from '../logger';
import { BasicResponse } from '../routerUtils';

export const createTask = async (userId: string, input: CreateTaskInput) => {
  try {
    const task = await db.task.create({
      data: {
        name: input.name,
        description: input.description,
        groupId: input.groupId,
      },
    });
    return task;
  } catch (e) {
    logger.error(e, { msg: 'Error creating a new task', userId });
    return null;
  }
};

export const setNotificationSettings = async (
  userId: string,
  input: NotificationSettingsInput
): Promise<BasicResponse> => {
  try {
    const task = await db.task.findFirst({
      where: {
        id: input.taskId,
        group: { members: { some: { userId, membershipType: 'owner' } } },
      },
    });
    if (!task) {
      logger.debug(
        'User tried to set notification settings for task but task was not found',
        { userId, taskId: input.taskId }
      );
      return {
        success: false,
        errorMessage:
          'Task not found or user does not have manage access to group',
        statusCode: 'NOT_FOUND',
      };
    }

    await db.taskNotificationSettings.upsert({
      where: { taskId: task.id },
      create: {
        ...input,
        taskId: task.id,
      },
      update: input,
    });
    return { success: true };
  } catch (e) {
    logger.error(e, {
      msg: 'Error while trying to set notification settings for task',
      userId,
      taskId: input.taskId,
    });
    return {
      success: false,
      errorMessage: 'Unknown error',
      statusCode: 'INTERNAL_SERVER_ERROR',
    };
  }
};
