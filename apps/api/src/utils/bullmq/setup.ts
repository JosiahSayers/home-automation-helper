import { Queue, Worker, Job } from 'bullmq';
import { environment } from '../environment';
import { sendNotification } from '../notifications';
import { processNotifications } from '../scheduledTask/runner';

export const notificationQueue = new Queue('notifications', {
  connection: environment.redisOptions(),
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'fixed',
      delay: 5000,
    },
  },
});

export const notificationCheckQueue = new Queue<{
  timeToCheck?: string;
}>('notification-check', {
  connection: environment.redisOptions(),
});

new Worker(
  'notifications',
  async (job: Job<Parameters<typeof sendNotification>>) => {
    return sendNotification(...job.data);
  },
  { concurrency: 50, connection: environment.redisOptions() }
);

new Worker(
  'notification-check',
  async (job: Job<{ timeToCheck?: string }>) => {
    const dateToCheck = job.data.timeToCheck
      ? new Date(job.data.timeToCheck)
      : new Date();
    return processNotifications(dateToCheck);
  },
  { connection: environment.redisOptions() }
);
