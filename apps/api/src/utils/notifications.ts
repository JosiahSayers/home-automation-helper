import { Group, Task, User } from '@prisma/client';
import { logger } from './logger';

/** TODO
 * Actually send a notification
 * Retry failed notifications
 * Log record of notifications to database
 */

export const sendNotification = (
  sendToUserId: string,
  params: NotificationParams
) => {
  const notificationData = {
    notificationName: params.notification,
    title: notifications[params.notification].title(params as any),
  };
  logger.debug(
    `Sending notification to user: ${sendToUserId}`,
    notificationData
  );
};

const notifications = {
  inviteAccepted: {
    title: ({ acceptedBy, group }: InviteAcceptedParams) =>
      `${acceptedBy.name} has joined ${group.name}`,
  },
  inviteRejected: {
    title: ({ rejectedBy, group }: InviteRejectedParams) =>
      `${rejectedBy.name} has declined your invite to join ${group.name}`,
  },
  scheduledTaskNotification: {
    title: ({ task }: ScheduledTaskNotificationParams) =>
      `Time to ${task.name}`,
  },
};

interface InviteAcceptedParams {
  notification: 'inviteAccepted';
  acceptedBy: User;
  group: Group;
}

interface InviteRejectedParams {
  notification: 'inviteRejected';
  rejectedBy: User;
  group: Group;
}

interface ScheduledTaskNotificationParams {
  notification: 'scheduledTaskNotification';
  task: Task;
}

type NotificationParams =
  | InviteAcceptedParams
  | InviteRejectedParams
  | ScheduledTaskNotificationParams;
