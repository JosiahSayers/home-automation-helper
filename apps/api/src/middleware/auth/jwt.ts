import { NextFunction, Request, Response } from 'express';
import { firebaseAuth } from '../../utils/authentication/firebase-admin';

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.sendStatus(401);
  }
  const decodedToken = await firebaseAuth.verifyIdToken(token);
  req.jwt = decodedToken;
  next();
};
