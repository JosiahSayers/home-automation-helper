import { Router } from 'express';
import { validateBody, ValidatedBody } from '../middleware/validateBody';
import { createUser } from '../utils/users';
import { CreateUserInput, createUserValidator } from 'validations';
import { getUser } from '../middleware/auth/jwt';
import { db } from '../utils/db';
import { doPasswordsMatch } from '../utils/users/password';
import { createSessionToken } from '../utils/authentication/session';

const router = Router();

router.post('/', validateBody(createUserValidator), async (req: ValidatedBody<CreateUserInput>, res) => {
  const user = await createUser(req.body);
  return user ? res.json(user) : res.sendStatus(500);
});

router.get('/current', getUser, async (req, res) => res.json(await db.user.findUnique({ where: { id: req.uid } })));

router.post('/authenticate', async (req, res) => {
  const user = await db.user.findUnique({ where: { email: req.body.email } });
  if (!user) {
    return res.status(401).json({ msg: 'User not found or password not correct' });
  }
  const passwordsMatch = await doPasswordsMatch(req.body.password, user.password);
  if (!passwordsMatch) {
    return res.status(401).json({ msg: 'User not found or password not correct' });
  }
  const token = await createSessionToken(user.id);
  return res.json({ idToken: token });
});

export { router as usersRouter };
