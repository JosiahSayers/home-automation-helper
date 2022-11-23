import { NextFunction, Request, Response } from 'express';
import { db } from '../../../utils/db';

export const userCanManageGroup = async (req: Request, res: Response, next: NextFunction) => {
  const groupWithUserAsOwner = await db.group.findFirst({
    where: {
      id: req.params.groupId,
      members: {
        some: {
          userId: req.uid,
          membershipType: 'owner'
        },
      },
    }
  });
  if (!groupWithUserAsOwner) {
    return res.status(401).json({ msg: 'User does not have access to manage this group' });
  }
  return next();
};
