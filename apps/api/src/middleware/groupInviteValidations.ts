import { NextFunction, Request, Response } from 'express';
import { GroupInviteStatus } from '@prisma/client';

export const validInviteAction = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const validActions: string[] = Object.values(GroupInviteStatus).filter(
    (status) => status !== 'pending'
  );
  if (!validActions.includes(req.params.action)) {
    return res.status(403).json({
      msg: `Invalid invite action sent: ${
        req.params.action
      }. Valid actions: ${validActions.join(', ')}`,
    });
  }
  return next();
};
