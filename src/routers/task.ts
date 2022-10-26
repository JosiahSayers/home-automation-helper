import { Router } from 'express';
import { db } from '../utils/db';
import { createTaskValidator } from '../validation/task/create';
import { searchTaskValidator } from '../validation/task/search';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const query = await searchTaskValidator.validate(req.query);
    const results = await db.task.findMany({
      where: {
        type: query.type,
        completedBy: query.completedBy,
        createdAt: {
          gte: query.after
        }
      },
      take: query.take,
      skip: query.skip,
    });
    return res.status(200).json({ results });
  } catch (e) {
    console.error('Error searching tasks', e);
    return res.sendStatus(500);
  }
});

router.post('/', async (req, res) => {
  try {
    const { type, completedBy } = await createTaskValidator.validate(req.body);
    await db.task.create({
      data: {
        type,
        completedBy,
      }
    });
    return res.sendStatus(200);
  } catch (e) {
    console.error('Error creating task', e);
    return res.sendStatus(500);
  }
});

export { router as taskRouter };
