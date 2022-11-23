import { Router } from 'express';
import {
  CreateGroupInput,
  createGroupValidator,
  InviteUserToGroupInput,
  inviteUserToGroupValidator,
} from 'validations';
import { userCanManageGroup } from '../middleware/auth/groups/userCanManageGroup';
import { validateBody, ValidatedBody } from '../middleware/validateBody';
import { inviteUserToGroup } from '../utils/groups/membership';
import {
  createGroup,
  getGroupsForUser,
  getGroupWithMembers,
  updateGroup,
} from '../utils/groups/queries';

const router = Router();

router.get('/', async (req, res) => {
  const groups = await getGroupsForUser(req.uid);
  return res.json(groups);
});

router.get('/:groupId', async (req, res) => {
  const group = await getGroupWithMembers(req.params.groupId, req.uid);
  return group ? res.json(group) : res.sendStatus(404);
});

router.put(
  '/:groupId',
  userCanManageGroup,
  validateBody(createGroupValidator.partial()),
  async (req: ValidatedBody<Partial<CreateGroupInput>>, res) => {
    const updatedGroup = await updateGroup(req.params.groupId, req.body);
    return updatedGroup ? res.json(updatedGroup) : res.sendStatus(401);
  }
);

router.post(
  '/',
  validateBody(createGroupValidator),
  async (req: ValidatedBody<CreateGroupInput>, res) => {
    const group = await createGroup(req.body, req.uid);
    return res.json(group);
  }
);

router.post(
  '/:groupId/invite',
  userCanManageGroup,
  validateBody(inviteUserToGroupValidator),
  async (req: ValidatedBody<InviteUserToGroupInput>, res) => {
    const successful = await inviteUserToGroup(
      req.params.groupId,
      req.uid,
      req.body.email
    );
    return successful
      ? res.sendStatus(200)
      : res.status(500).json({ msg: 'Unable to invite user to group' });
  }
);

export { router as groupsRouter };
