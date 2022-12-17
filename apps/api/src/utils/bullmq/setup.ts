import { Queue, Worker, Job } from 'bullmq';
import { sendNotification } from '../notifications';
import { processNotifications } from '../scheduledTask/runner';

const connection = {
  host: '127.0.0.1',
  port: 6379,
};

export const notificationQueue = new Queue('notifications', {
  connection,
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
  connection,
});

new Worker(
  'notifications',
  async (job: Job<Parameters<typeof sendNotification>>) => {
    sendNotification(...job.data);
  },
  { concurrency: 50, connection }
);

new Worker(
  'notification-check',
  async (job: Job<{ timeToCheck?: string }>) => {
    const dateToCheck = job.data.timeToCheck
      ? new Date(job.data.timeToCheck)
      : new Date();
    return processNotifications(dateToCheck);
  },
  { connection }
);
