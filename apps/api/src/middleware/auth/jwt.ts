import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../../utils/authentication/session';

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return next();
  }
  const verificationResponse = verifyToken(token);
  if (!verificationResponse) {
    return next();
  }
  req.uid = verificationResponse;
  next();
};

export const requireUser = (req: Request, res: Response, next: NextFunction) => {
  if (!req.uid) {
    return res.sendStatus(401);
  }
  next();
};
