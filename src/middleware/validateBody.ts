import { NextFunction, Response, Request } from 'express';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { logger } from '../utils/logger';

export const validateBody =
  <T extends z.AnyZodObject>(schema: T) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await schema.parseAsync(req.body);
        next();
      } catch (e) {
        logger.error(e, {
          msg: 'failed to validate request body',
          path: req.path,
          method: req.method,
        });
        const validationError = fromZodError(e);
        return res.status(403).json({
          validationError: validationError.message,
          fieldsWithErrors: validationError.details.flatMap((zodIssue) =>
            zodIssue.path.join('.')
          ),
        });
      }
    };

export interface ValidatedBody<T> extends Request {
  body: T;
}
