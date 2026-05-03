import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeProjectRole } from '../middleware/projectRole.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
    createProject,
    getAllProject,
    getProjectById,
    addMember,
    removeMember,
    leaveProject,
    deleteProject,
    changeMemberRole,
    getProjectMembers
} from '../controllers/project.controllers.js';
import {
    createProjectValidation,
    addMemberValidation,
    changeMemberRoleValidation
} from '../validation/project.validation.js';
import { Router } from "express";

const router = Router();


router.post('/', authenticate, validate(createProjectValidation), createProject);
router.get('/', authenticate, getAllProject);
router.get('/:id', authenticate, getProjectById);
router.delete('/:id', authenticate, authorizeProjectRole('admin'), deleteProject);

router.post('/:id/members', authenticate, authorizeProjectRole('admin'), validate(addMemberValidation), addMember);
router.delete('/:id/members/:userId', authenticate, authorizeProjectRole('admin'), removeMember);
router.patch('/:id/members/:userId/role', authenticate, authorizeProjectRole('admin'), validate(changeMemberRoleValidation), changeMemberRole);
router.get('/:id/members', authenticate, authorizeProjectRole('admin', 'member'), getProjectMembers)

router.delete('/:id/leave', authenticate, leaveProject);

export default router;