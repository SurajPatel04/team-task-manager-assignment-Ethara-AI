import { z } from 'zod'

export const createProjectValidation = z.object({
    name: z.string().min(1, "Project name is required").max(100, "Project name cannot exceed 100 characters"),
    description: z.string().max(1000, "Description cannot exceed 1000 characters").optional(),
})

export const addMemberValidation = z.object({
    email: z.email('Valid email required')
})

export const changeMemberRoleValidation = z.object({
    role: z.enum(['admin', 'member'], { message: 'Invalid role' })
})