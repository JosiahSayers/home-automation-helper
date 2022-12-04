import { Router } from 'express';
import { requireUser } from '../middleware/auth/jwt';
import { validInviteAction } from '../middleware/groupInviteValidations';
import { db } from '../utils/db';
import { acceptGroupInvite } from '../utils/groups/membership';

const router = Router();

router.get('/:inviteId', requireUser, async (req, res) => {
  const inviteInfo = await db.groupInvite.findUnique({
    where: { id: req.params.inviteId },
    select: {
      status: true,
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

router.post(
  '/:inviteId/:action',
  requireUser,
  validInviteAction,
  async (req, res) => {
    const inviteAcceptStatus = await acceptGroupInvite(
      req.params.inviteId,
      req.uid
    );
    if (!inviteAcceptStatus.success) {
      return res
        .status(inviteAcceptStatus.httpStatusCode)
        .json({ msg: inviteAcceptStatus.errorMessage });
    }
    return res.sendStatus(200);
  }
);

export { router as groupInviteRouter };
