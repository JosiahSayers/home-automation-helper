import { Router } from 'express';
import { validateBody, ValidatedBody } from '../middleware/validateBody';
import { createUser } from '../utils/users';
import { CreateUserInput, createUserValidator } from 'validations';
import { environment } from '../utils/environment';
import { signInAs } from '../utils/test-helpers/user-auth-helpers';

const router = Router();

router.post('/', validateBody(createUserValidator), async (req: ValidatedBody<CreateUserInput>, res) => {
  const user = await createUser(req.body);
  return user ? res.json(user) : res.sendStatus(500);
});

router.get('/', (req, res) => res.json(req.jwt));

router.post('/test-sign-in', async (req, res) => {
  if (environment.isProduction()) {
    return res.sendStatus(404);
  }
  return res.json(await signInAs(req.body.email, req.body.password));
});

export { router as usersRouter };
