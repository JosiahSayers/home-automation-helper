import {
  ExpressAdapter,
  createBullBoard,
  BullMQAdapter,
} from '@bull-board/express';
import { notificationCheckQueue, notificationQueue } from './setup';

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [
    new BullMQAdapter(notificationQueue),
    new BullMQAdapter(notificationCheckQueue),
  ],
  serverAdapter,
});

export { serverAdapter };
