import { Router } from 'express';
import { db } from '../utils/db';

const router = Router();

const isDbConnected = async () => {
  try {
    return !!(await db.task.findFirst());
  } catch (e) {
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
