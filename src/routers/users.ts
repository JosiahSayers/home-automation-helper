import { Router } from 'express';
import { validateBody, ValidatedBody } from '../middleware/validateBody';
import { createUser } from '../utils/users';
import { CreateUserInput, createUserValidator } from '../validation/users/create';

const router = Router();

router.post('/', validateBody(createUserValidator), async (req: ValidatedBody<CreateUserInput>, res) => {
  const user = await createUser(req.body);
  return user ? res.json(user) : res.sendStatus(500);
});

export { router as usersRouter };
