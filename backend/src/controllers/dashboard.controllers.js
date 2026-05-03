import { Task } from '../models/tasks.models.js'
import { Project } from '../models/projects.models.js'
import { asyncHandler } from '../utils/asyncHandler.utils.js'
import { ApiResponse } from '../utils/apiResponse.utils.js'
import { ApiError } from '../utils/apiError.utils.js'

export const getDashboardSummary = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const project = req.project

    const baseFilter = { projectId: project._id }

    const member = project.members.find(m => m.userId.equals(userId))
    const userRole = member?.role || 'member'

    // Stats filter
    const statsFilter = { ...baseFilter }
    if (userRole === 'member') {
        statsFilter.assignedTo = userId
    }

    // Overdue filter
    const overdueFilter = {
        ...baseFilter,
        dueDate: { $lt: new Date() },
        status: { $ne: 'done' }
    }
    if (userRole === 'member') {
        overdueFilter.assignedTo = userId
    }

    const [tasks, overdueTasks] = await Promise.all([
        Task.find(statsFilter),
        Task.find(overdueFilter)
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email')
            .sort({ dueDate: 1 })
    ])

    const stats = {
        total: tasks.length,
        todo: tasks.filter(t => t.status === 'todo').length,
        inprogress: tasks.filter(t => t.status === 'inprogress').length,
        done: tasks.filter(t => t.status === 'done').length,
        overdue: overdueTasks.length
    }

    return res.status(200).json(
        new ApiResponse(true, 200, 'Dashboard summary fetched', {
            stats,
            overdueTasks
        })
    )
})

export const getDashboardStats = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const project = req.project

    const filter = { projectId: project._id }

    const member = project.members.find(m => m.userId.equals(userId))
    if (member.role === 'member') {
        filter.assignedTo = userId
    }

    const tasks = await Task.find(filter)

    const overdueTasks = await Task.find({
        projectId: project._id,
        dueDate: { $lt: new Date() },
        status: { $ne: 'done' }
    })

    const stats = {
        total: tasks.length,
        todo: tasks.filter(t => t.status === 'todo').length,
        inprogress: tasks.filter(t => t.status === 'inprogress').length,
        done: tasks.filter(t => t.status === 'done').length,
        overdue: overdueTasks.length
    }

    return res.status(200).json(
        new ApiResponse(true, 200, 'Dashboard stats fetched', stats)
    )
})


export const getDashboardTasks = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const project = req.project
    const tab = req.query.tab || 'critical'
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const filter = { projectId: project._id }

    // Role-based access control (base filter)
    const member = project.members.find(m => m.userId.equals(userId))
    if (member.role === 'member') {
        filter.assignedTo = userId
    }

    // Apply tab-specific filters
    switch (tab) {
        case 'critical':
            filter.dueDate = { $lt: new Date() }
            filter.status = { $ne: 'done' }
            break
        case 'completed':
            filter.status = 'done'
            break
        case 'inprogress':
            filter.status = 'inprogress'
            break
        case 'assigned':
            // Even for admins, this tab shows only their own tasks
            filter.assignedTo = userId
            break
        case 'unassigned':
            filter.assignedTo = null
            break
        case 'todo':
            filter.status = 'todo'
            break
        default:
            // Default to critical if tab is invalid
            filter.dueDate = { $lt: new Date() }
            filter.status = { $ne: 'done' }
    }

    const total = await Task.countDocuments(filter)

    const tasks = await Task.find(filter)
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .sort(tab === 'critical' ? { dueDate: 1 } : { updatedAt: -1 })
        .skip(skip)
        .limit(limit)

    return res.status(200).json(
        new ApiResponse(true, 200, `Dashboard ${tab} tasks fetched`, {
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
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
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