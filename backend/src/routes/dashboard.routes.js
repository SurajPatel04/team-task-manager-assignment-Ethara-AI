import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { authorizeProjectRole } from '../middleware/projectRole.middleware.js'
import {
    getDashboardStats,
    getDashboardTasks,
    getTasksPerUser,
    getDashboardSummary
} from '../controllers/dashboard.controllers.js'

const router = Router()

router.get('/summary', authenticate, authorizeProjectRole('admin', 'member'), getDashboardSummary)
router.get('/stats', authenticate, authorizeProjectRole('admin', 'member'), getDashboardStats)
router.get('/tasks', authenticate, authorizeProjectRole('admin', 'member'), getDashboardTasks)
router.get('/user-tasks', authenticate, authorizeProjectRole('admin'), getTasksPerUser)

export default router