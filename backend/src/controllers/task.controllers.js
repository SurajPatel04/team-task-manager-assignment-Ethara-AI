import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiResponse } from "../utils/apiResponse.utils.js";
import { ApiError } from "../utils/apiError.utils.js";
import { Task } from "../models/tasks.models.js";
import mongoose from "mongoose";
import { Project } from "../models/projects.models.js";
import { User } from "../models/user.models.js";


export const createTask = asyncHandler(async (req, res) => {
    const { title, description, dueDate, priority, assignedTo } = req.body
    const project = req.project

    if (assignedTo) {
        const isProjectMember = project.members.some(
            m => m.userId.equals(assignedTo)
        )
        if (!isProjectMember) {
            throw new ApiError(400, 'Assigned user is not a member of this project')
        }
    }

    const task = await Task.create({
        title,
        description,
        dueDate,
        priority,
        assignedTo: assignedTo || null,
        projectId: project._id,
        createdBy: req.user._id,
        status: 'todo'
    })

    return res.status(201).json(
        new ApiResponse(true, 201, 'Task created successfully', task)
    )
})

export const getAllTasks = asyncHandler(async (req, res) => {
    const project = req.project
    const { status, priority } = req.query
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const filter = { projectId: project._id }

    const member = project.members.find(
        m => m.userId.equals(req.user._id)
    )
    if (member.role === 'member') {
        filter.assignedTo = req.user._id
    }

    if (status) filter.status = status
    if (priority) filter.priority = priority

    const total = await Task.countDocuments(filter)

    const tasks = await Task.find(filter)
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)

    return res.status(200).json(
        new ApiResponse(true, 200, 'Tasks fetched successfully', {
            tasks,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        })
    )
})

export const getTaskById = asyncHandler(async (req, res) => {
    const { id } = req.params
    const project = req.project

    const task = await Task.findById(id)
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')

    if (!task) {
        throw new ApiError(404, 'Task not found')
    }

    if (!task.projectId.equals(project._id)) {
        throw new ApiError(403, 'Task does not belong to this project')
    }

    const member = project.members.find(m => m.userId.equals(req.user._id))
    if (member.role === 'member' && !task.assignedTo?._id.equals(req.user._id)) {
        throw new ApiError(403, 'You can only view your assigned tasks')
    }

    return res.status(200).json(
        new ApiResponse(true, 200, 'Task fetched successfully', task)
    )
})

export const updateTask = asyncHandler(async (req, res) => {
    const { id } = req.params
    const project = req.project
    const { title, description, dueDate, priority, assignedTo, status } = req.body

    const task = await Task.findById(id)
    if (!task) {
        throw new ApiError(404, 'Task not found')
    }

    if (!task.projectId.equals(project._id)) {
        throw new ApiError(403, 'Task does not belong to this project')
    }

    if (assignedTo) {
        const isProjectMember = project.members.some(
            m => m.userId.equals(assignedTo)
        )
        if (!isProjectMember) {
            throw new ApiError(400, 'Assigned user is not a member of this project')
        }
    }

    if (title) task.title = title
    if (description) task.description = description
    if (dueDate) task.dueDate = dueDate
    if (priority) task.priority = priority
    if (status) {
        if (status === 'done') {
            task.completedAt = new Date()
        } else {
            task.completedAt = null
        }
        task.status = status
    }
    if (assignedTo !== undefined) task.assignedTo = assignedTo || null

    await task.save()

    return res.status(200).json(
        new ApiResponse(true, 200, 'Task updated successfully', task)
    )
})

export const updateTaskStatus = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { status } = req.body
    const project = req.project

    const task = await Task.findById(id)
    if (!task) {
        throw new ApiError(404, 'Task not found')
    }

    if (!task.projectId.equals(project._id)) {
        throw new ApiError(403, 'Task does not belong to this project')
    }

    const member = project.members.find(m => m.userId.equals(req.user._id))
    if (member.role === 'member') {
        if (!task.assignedTo?.equals(req.user._id)) {
            throw new ApiError(403, 'You can only update status of your assigned tasks')
        }
    }

    if (status === 'done') {
        task.completedAt = new Date()
    } else {
        task.completedAt = null
    }

    task.status = status
    await task.save()

    return res.status(200).json(
        new ApiResponse(true, 200, 'Task status updated successfully', task)
    )
})

export const deleteTask = asyncHandler(async (req, res) => {
    const { id } = req.params
    const project = req.project

    const task = await Task.findById(id)
    if (!task) {
        throw new ApiError(404, 'Task not found')
    }

    if (!task.projectId.equals(project._id)) {
        throw new ApiError(403, 'Task does not belong to this project')
    }

    await Task.findByIdAndDelete(id)

    return res.status(200).json(
        new ApiResponse(true, 200, 'Task deleted successfully')
    )
})