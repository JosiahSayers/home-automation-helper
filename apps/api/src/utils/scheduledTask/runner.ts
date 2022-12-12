import { db } from '../db';
import { logger } from '../logger';
import { sendNotification } from '../notifications';

const getNotificationsForCurrentMinute = async () => {
  const sharedInclude = {
    group: {
      select: {
        members: true,
      },
    },
    notificationSettings: {
      select: {
        title: true,
      },
    },
  };
  const now = new Date();
  const time = { hour: now.getUTCHours(), minute: now.getUTCMinutes() };
  const [dailyNotifications, weeklyNotifications, monthlyNotifications] =
    await db.$transaction([
      db.task.findMany({
        include: sharedInclude,
        where: {
          notificationSettings: {
            schedule: 'daily',
            ...time,
          },
        },
      }),
      db.task.findMany({
        include: sharedInclude,
        where: {
          notificationSettings: {
            schedule: 'weekly',
            dayOfWeek: now.getUTCDay(),
            ...time,
          },
        },
      }),
      db.task.findMany({
        include: sharedInclude,
        where: {
          notificationSettings: {
            schedule: 'monthly',
            dayOfMonth: now.getUTCDate(),
            ...time,
          },
        },
      }),
    ]);

  return [
    ...dailyNotifications,
    ...weeklyNotifications,
    ...monthlyNotifications,
  ];
};

export type ScheduledNotificationData = Awaited<
  ReturnType<typeof getNotificationsForCurrentMinute>
>[number];

const processNotifications = async () => {
  const runnerRecord = await db.notificationRunnerRecord.create({ data: {} });
  const tasksToNotify = await getNotificationsForCurrentMinute();
  logger.info('Tasks to notify', { tasks: tasksToNotify.map((t) => t.id) });
  tasksToNotify.forEach((task) => {
    task.group?.members.forEach((member) => {
      sendNotification(member.userId, {
        notification: 'scheduledTaskNotification',
        task,
      });
    });
  });
  await db.notificationRunnerRecord.update({
    where: { id: runnerRecord.id },
    data: { completedAt: new Date() },
  });
};

export const startNotificationRunner = () => {
  processNotifications();
  const oneMinute = 60_000;
  setInterval(() => processNotifications(), oneMinute);
};
