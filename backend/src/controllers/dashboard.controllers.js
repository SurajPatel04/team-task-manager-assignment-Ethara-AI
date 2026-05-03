import { Task } from '../models/task.models.js'
import { Project } from '../models/projects.models.js'
import { asyncHandler } from '../utils/asyncHandler.utils.js'
import { ApiResponse } from '../utils/apiResponse.utils.js'
import { ApiError } from '../utils/apiError.utils.js'

export const getDashboardStats = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const project = req.project

    const filter = { projectId: project._id }

    const member = project.members.find(m => m.userId.equals(userId))
    if (member.role === 'member') {
        filter.assignedTo = userId
    }

    const tasks = await Task.find(filter)

    const stats = {
        total: tasks.length,
        todo: tasks.filter(t => t.status === 'todo').length,
        inprogress: tasks.filter(t => t.status === 'inprogress').length,
        done: tasks.filter(t => t.status === 'done').length,
    }

    return res.status(200).json(
        new ApiResponse(true, 200, 'Dashboard stats fetched', stats)
    )
})


export const getOverdueTasks = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const project = req.project

    const filter = {
        projectId: project._id,
        dueDate: { $lt: new Date() },
        status: { $ne: 'done' }
    }

    const member = project.members.find(m => m.userId.equals(userId))
    if (member.role === 'member') {
        filter.assignedTo = userId
    }

    const overdueTasks = await Task.find(filter)
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .sort({ dueDate: 1 })

    return res.status(200).json(
        new ApiResponse(true, 200, 'Overdue tasks fetched', {
            total: overdueTasks.length,
            tasks: overdueTasks
        })
    )
})


export const getTasksPerUser = asyncHandler(async (req, res) => {
    const project = req.project

    const tasksPerUser = await Task.aggregate([
        { $match: { projectId: project._id } },
        {
            $group: {
                _id: '$assignedTo',
                total: { $sum: 1 },
                todo: { $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] } },
                inprogress: { $sum: { $cond: [{ $eq: ['$status', 'inprogress'] }, 1, 0] } },
                done: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'user'
            }
        },
        { $unwind: { path: '$user', preserveNullAndEmpty: true } },
        {
            $project: {
                _id: 0,
                user: { name: 1, email: 1 },
                total: 1,
                todo: 1,
                inprogress: 1,
                done: 1
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(true, 200, 'Tasks per user fetched', tasksPerUser)
    )
})