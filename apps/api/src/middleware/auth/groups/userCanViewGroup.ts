import { NextFunction, Request, Response } from 'express';
import { db } from '../../../utils/db';

export const userCanViewGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const groupWithUserAsMember = await db.group.findFirst({
    where: {
      id: req.params.groupId,
      members: {
        some: {
          userId: req.uid,
        },
      },
    },
  });
  if (!groupWithUserAsMember) {
    return res
      .status(401)
      .json({ msg: 'User does not have access to this group' });
  }
  return next();
};
