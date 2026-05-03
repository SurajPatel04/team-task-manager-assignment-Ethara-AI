import { Project } from '../models/projects.models.js';
import { ApiError } from '../utils/apiError.utils.js';
import { asyncHandler } from '../utils/asyncHandler.utils.js';
import { ApiResponse } from '../utils/apiResponse.utils.js';
import { User } from '../models/user.models.js';
import { Task } from '../models/tasks.models.js';
import mongoose from 'mongoose';

export const createProject = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    const existingProject = await Project.findOne({ name });
    if (existingProject) {
        throw new ApiError(400, "Project already exists");
    }

    const project = await Project.create({
        name: name,
        description: description || null,
        createdBy: req.user._id,
        members: [{
            userId: req.user._id,
            role: 'admin'
        }]
    })

    return res.status(201).json(new ApiResponse(true, 201, 'Project created successfully', project))
})


export const getAllProject = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { search, page = 1, limit = 10 } = req.query;

    const filter = { 'members.userId': userId };
    
    if (search) {
        filter.name = { $regex: search, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [projects, total] = await Promise.all([
        Project.find(filter)
            .populate('createdBy', 'name email')
            .populate('members.userId', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        Project.countDocuments(filter)
    ]);

    return res.status(200).json(new ApiResponse(true, 200, 'Projects fetched successfully', {
        projects,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / parseInt(limit))
        }
    }))
})

export const getProjectById = asyncHandler(async (req, res) => {
    const { id } = req.params
    const userId = req.user._id

    const project = await Project.findById(id)
        .populate('createdBy', 'name email')
        .populate('members.userId', 'name email')

    if (!project) {
        throw new ApiError(404, 'Project not found')
    }

    const isMember = project.members.some(
        (m) => m.userId._id.toString() === userId.toString()
    )

    if (!isMember) {
        throw new ApiError(403, 'You are not a member of this project')
    }

    return res.status(200).json(
        new ApiResponse(true, 200, 'Project fetched successfully', project)
    )
})

export const addMember = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { email } = req.body

    const project = await Project.findById(id)
    if (!project) {
        throw new ApiError(404, 'Project not found')
    }

    const userToAdd = await User.findOne({ email })
    if (!userToAdd) {
        throw new ApiError(404, 'User with this email not found')
    }

    const alreadyMember = project.members.some(
        (m) => m.userId.toString() === userToAdd._id.toString()
    )

    if (alreadyMember) {
        throw new ApiError(400, 'User is already a member of this project')
    }

    project.members.push({
        userId: userToAdd._id,
        role: 'member'
    })

    await project.save()

    return res.status(200).json(
        new ApiResponse(true, 200, 'Member added successfully', project)
    )
})

export const removeMember = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const project = req.project

    if (userId === req.user._id.toString()) {
        throw new ApiError(400, 'You cannot remove yourself.')
    }

    if (project.createdBy.equals(userId)) {
        throw new ApiError(400, 'Cannot remove project creator')
    }

    const targetMember = project.members.find(m => m.userId.equals(userId))
    if (!targetMember) {
        throw new ApiError(404, 'User is not a member')
    }

    if (targetMember.role === 'admin') {
        const adminCount = project.members.filter(m => m.role === 'admin').length
        if (adminCount === 1) {
            throw new ApiError(400, 'Cannot remove the only admin')
        }
    }

    await Project.findByIdAndUpdate(project._id, {
        $pull: { members: { userId: new mongoose.Types.ObjectId(userId) } }
    })

    const userToRemove = await User.findById(userId).select('name')

    return res.status(200).json(
        new ApiResponse(true, 200, `Successfully removed ${userToRemove ? userToRemove.name : 'the user'} (${targetMember.role}) from the project.`)
    )
})


export const leaveProject = asyncHandler(async (req, res) => {
    const { id } = req.params
    const userId = req.user._id

    const project = await Project.findById(id)
    if (!project) {
        throw new ApiError(404, 'Project not found')
    }

    if (project.createdBy.equals(userId)) {
        throw new ApiError(400, 'Project creator cannot leave')
    }

    const member = project.members.find(m => m.userId.equals(userId))
    if (!member) {
        throw new ApiError(403, 'You are not a member')
    }

    if (member.role === 'admin') {
        const adminCount = project.members.filter(m => m.role === 'admin').length
        if (adminCount === 1) {
            throw new ApiError(400, 'Assign another admin before leaving')
        }
    }

    await Project.findByIdAndUpdate(project._id, {
        $pull: { members: { userId } }
    })

    return res.status(200).json(
        new ApiResponse(true, 200, 'You have left the project successfully')
    )
})

export const deleteProject = asyncHandler(async (req, res) => {
    const project = req.project

    if (!project.createdBy.equals(req.user._id)) {
        throw new ApiError(403, 'Only project creator can delete this project')
    }

    await Task.deleteMany({ projectId: project._id })
    await Project.findByIdAndDelete(project._id)

    return res.status(200).json(
        new ApiResponse(true, 200, 'Project deleted successfully')
    )
})

export const changeMemberRole = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const { role } = req.body
    const project = req.project

    if (project.createdBy.equals(userId)) {
        throw new ApiError(400, 'Cannot change role of project creator')
    }

    const member = project.members.find(m => m.userId.equals(userId))
    if (!member) {
        throw new ApiError(404, 'Member not found')
    }

    if (member.role === role) {
        throw new ApiError(400, `User is already assigned the '${role}' role.`)
    }

    if (member.role === 'admin' && role === 'member') {
        const adminCount = project.members.filter(m => m.role === 'admin').length
        if (adminCount === 1) {
            throw new ApiError(400, 'Cannot demote the only admin')
        }
    }

    member.role = role
    await project.save()

    return res.status(200).json(
        new ApiResponse(true, 200, `Member role has been successfully updated to ${role}.`)
    )
})

export const getProjectMembers = asyncHandler(async (req, res) => {
    const project = req.project

    const populatedProject = await Project.findById(project._id)
        .populate('members.userId', 'name email')

    const members = populatedProject.members.map(m => ({
        userId: m.userId, // This is the populated user object { _id, name, email }
        role: m.role,
        joinedAt: m.joinedAt
    }))

    return res.status(200).json(
        new ApiResponse(true, 200, 'Project members fetched successfully', members)
    )
})