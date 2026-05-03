import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { authorizeProjectRole } from '../middleware/projectRole.middleware.js'
import {
    getDashboardStats,
    getOverdueTasks,
    getTasksPerUser
} from '../controllers/dashboard.controllers.js'

const router = Router()

router.get('/stats', authenticate, authorizeProjectRole('admin', 'member'), getDashboardStats)
router.get('/overdue', authenticate, authorizeProjectRole('admin', 'member'), getOverdueTasks)
router.get('/user-tasks', authenticate, authorizeProjectRole('admin'), getTasksPerUser)

export default router