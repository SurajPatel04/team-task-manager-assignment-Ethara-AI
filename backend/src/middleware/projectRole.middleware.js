import { Project } from '../models/projects.models.js';
import { ApiError } from '../utils/apiError.utils.js';
import { asyncHandler } from '../utils/asyncHandler.utils.js';

export const authorizeProjectRole = (...roles) => asyncHandler(async (req, res, next) => {
    const projectId = req.body?.projectId || req.query?.projectId || req.params.projectId || req.params.id;

    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, 'Project not found');
    }

    const member = project.members.find(
        (m) => m.userId.toString() === req.user._id.toString()
    )

    if (!member) {
        throw new ApiError(403, 'You are not a member of this project');
    }

    if (!roles.includes(member.role)) {
        throw new ApiError(403, `Access denied. Required role: ${roles.join(' or ')}`);
    }

    req.project = project;
    next();
})