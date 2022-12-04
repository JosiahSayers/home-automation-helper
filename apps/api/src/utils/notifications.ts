import { Group, User } from '@prisma/client';
import { logger } from './logger';

/** TODO
 * Actually send a notification
 * Make promise always resolve when created and retry failed notifications
 * Log record of notifications to database
 */

export const sendNotification = async (
  notification: NotificationNames,
  params: NotificationParams[typeof notification]
) => {
  const notificationData = {
    notificationName: notification,
    title: notifications[notification].title(params),
  };
  logger.debug('Sending notification', notificationData);
};

const notifications = {
  inviteAccepted: {
    title: ({ acceptedBy, group }: NotificationParams['inviteAccepted']) =>
      `${acceptedBy.name} has joined ${group.name}`,
  },
};

type NotificationNames = keyof typeof notifications;

interface NotificationParams {
  inviteAccepted: {
    acceptedBy: User;
    group: Group;
  };
}
