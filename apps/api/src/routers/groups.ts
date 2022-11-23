import { Router } from 'express';
import { CreateGroupInput, createGroupValidator } from 'validations';
import { validateBody, ValidatedBody } from '../middleware/validateBody';
import { db } from '../utils/db';

const router = Router();

router.get('/', async (req, res) => {
  const groups = await db.group.findMany({
    where: {
      members: {
        some: {
          userId: req.uid,
        },
      },
    },
  });
  return res.json(groups);
});

router.get('/:id', async (req, res) => {
  const group = await db.group.findFirst({
    where: {
      id: req.params.id,
      members: {
        some: {
          userId: req.uid,
        }
      }
    },
    include: {
      members: {
        select: {
          userId: true,
          membershipType: true,
          user: {
            select: {
              name: true
            }
          }
        }
      },
    },
  });

  return group ? res.json(group) : res.sendStatus(404);
});

router.post(
  '/',
  validateBody(createGroupValidator),
  async (req: ValidatedBody<CreateGroupInput>, res) => {
    const group = await db.group.create({
      data: {
        name: req.body.name,
        description: req.body.description,
        members: {
          create: {
            userId: req.uid,
            membershipType: 'owner',
          },
        },
      },
    });

    return res.json(group);
  }
);

export { router as groupsRouter };
