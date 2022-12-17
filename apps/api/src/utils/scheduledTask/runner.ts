import { notificationCheckQueue, notificationQueue } from '../bullmq/setup';
import { db } from '../db';
import { logger } from '../logger';

const getNotificationsForMinute = async (minute: Date) => {
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
  const sharedTime = {
    hour: minute.getUTCHours(),
    minute: minute.getUTCMinutes(),
  };
  const [dailyNotifications, weeklyNotifications, monthlyNotifications] =
    await db.$transaction([
      db.task.findMany({
        include: sharedInclude,
        where: {
          notificationSettings: {
            schedule: 'daily',
            ...sharedTime,
          },
        },
      }),
      db.task.findMany({
        include: sharedInclude,
        where: {
          notificationSettings: {
            schedule: 'weekly',
            dayOfWeek: minute.getUTCDay(),
            ...sharedTime,
          },
        },
      }),
      db.task.findMany({
        include: sharedInclude,
        where: {
          notificationSettings: {
            schedule: 'monthly',
            dayOfMonth: minute.getUTCDate(),
            ...sharedTime,
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
  ReturnType<typeof getNotificationsForMinute>
>[number];

export const processNotifications = async (notificationTime = new Date()) => {
  const runnerRecord = await db.notificationRunnerRecord.create({
    data: { createdAt: notificationTime },
  });
  const tasksToNotify = await getNotificationsForMinute(notificationTime);
  logger.info('Tasks to notify', { tasks: tasksToNotify.map((t) => t.id) });
  tasksToNotify.forEach((task) => {
    task.group?.members.forEach((member) => {
      notificationQueue.add('scheduledTaskNotification', [
        member.userId,
        {
          notification: 'scheduledTaskNotification',
          task,
        },
      ]);
    });
  });
  await db.notificationRunnerRecord.update({
    where: { id: runnerRecord.id },
    data: {
      completedAt: new Date(),
      numberOfTasksQueued: tasksToNotify.length,
    },
  });
};

// Run at application startup to make sure any downtime does not cause missed notifications
const processMissedNotifications = async () => {
  logger.info('Checking for missed notifications');
  const lastNotificationRun = await db.notificationRunnerRecord.findFirst({
    where: { completedAt: { not: null } },
    orderBy: { createdAt: 'desc' },
  });
  if (!lastNotificationRun) {
    logger.info('No notification run records found');
    return;
  }
  const timeToCheck = lastNotificationRun.createdAt;
  timeToCheck.setUTCMinutes(timeToCheck.getUTCMinutes() + 1);
  const timesChecked = [];
  while (timeToCheck.getTime() < new Date().getTime()) {
    timesChecked.push(timeToCheck.toISOString());
    await notificationCheckQueue.add('process-missed-notifications', {
      timeToCheck: timeToCheck.toUTCString(),
    });
    timeToCheck.setUTCMinutes(timeToCheck.getUTCMinutes() + 1);
  }
  logger.info('Processed missed notifications', { timesChecked });
};

export const startNotificationRunner = async () => {
  await processMissedNotifications();
  const oneMinute = 60_000;
  notificationCheckQueue.add(
    'check-every-minute',
    { timeToCheck: undefined },
    {
      repeat: {
        every: oneMinute,
        immediately: true,
      },
    }
  );
};
