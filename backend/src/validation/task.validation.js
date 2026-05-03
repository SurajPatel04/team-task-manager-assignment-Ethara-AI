import { z } from 'zod'

export const createTaskValidation = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().max(1000).optional(),
    dueDate: z.string().min(1, 'Due date is required'),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
    assignedTo: z.string().optional(),
    projectId: z.string().min(1, 'Project ID is required')
})

export const updateTaskValidation = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    dueDate: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    assignedTo: z.string().optional().nullable(),
    status: z.enum(['todo', 'inprogress', 'done']).optional()
})

export const updateTaskStatusValidation = z.object({
    status: z.enum(['todo', 'inprogress', 'done'], {
        message: 'Status must be todo, inprogress or done'
    })
})