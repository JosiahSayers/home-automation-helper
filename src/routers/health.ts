import { Router } from 'express';
import { db } from '../utils/db';
import { logger } from '../utils/logger';

const router = Router();

const isDbConnected = async () => {
  try {
    return !!(await db.task.findFirst());
  } catch (e) {
    logger.error('Error in healthcheck:isdbConnected', e);
    return false;
  }
};

router.get('/', async (req, res) => {
  const dbConnected = await isDbConnected();
  return res.status(dbConnected ? 200 : 500).json({
    up: true,
    dbConnected,
  });
});

export { router as healthRouter };
