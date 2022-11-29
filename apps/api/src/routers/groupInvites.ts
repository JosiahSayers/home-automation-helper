import { Router } from 'express';
import { validInviteAction } from '../middleware/groupInviteValidations';
import { db } from '../utils/db';

const router = Router();

router.get('/:inviteId', async (req, res) => {
  const inviteInfo = await db.groupInvite.findUnique({
    where: { id: req.params.inviteId },
    select: {
      createdAt: true,
      invitedBy: {
        select: {
          name: true,
        },
      },
      group: {
        select: {
          name: true,
        },
      },
    },
  });

  return inviteInfo ? res.json(inviteInfo) : res.sendStatus(404);
});

router.post('/:inviteId/:action', validInviteAction, async (req, res) => {
  return res.sendStatus(200);
});

export { router as groupInviteRouter };
