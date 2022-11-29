import { NextFunction, Response, Request } from 'express';
import { environment } from '../utils/environment';

export const validateApiKey = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestKey = req.headers['x-api-key'];

  if (
    !requestKey ||
    typeof requestKey !== 'string' ||
    !environment.validApiKeys().includes(requestKey)
  ) {
    return res.sendStatus(401);
  }

  return next();
};
