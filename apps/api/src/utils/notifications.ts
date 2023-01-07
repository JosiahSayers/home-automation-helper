import { Group, User } from '@prisma/client';
import { logger } from './logger';
import { ScheduledNotificationData } from './scheduledTask/runner';

/** TODO
 * Actually send a notification
 * Retry failed notifications
 * Log record of notifications to database
 */

export const sendNotification = async (
  sendToUserId: string,
  params: NotificationParams
) => {
  const notificationData = {
    notificationName: params.notification,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      task.notificationSettings?.title,
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
  task: ScheduledNotificationData;
}

type NotificationParams =
  | InviteAcceptedParams
  | InviteRejectedParams
  | ScheduledTaskNotificationParams;
