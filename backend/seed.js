// seed.js
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { User } from './src/models/user.models.js'
import { Project } from './src/models/projects.models.js'
import { Task } from './src/models/tasks.models.js'

dotenv.config()

// ─── Helper Data ────────────────────────────────────────────────────────────

const projectTemplates = [
    { name: 'E-Commerce Platform', description: 'Full stack online shopping platform with payment integration' },
    { name: 'Mobile Banking App', description: 'Secure mobile banking application with UPI support' },
    { name: 'HR Management System', description: 'Employee management and payroll system' },
    { name: 'Inventory Management', description: 'Real-time inventory tracking and management system' },
    { name: 'CRM Dashboard', description: 'Customer relationship management tool for sales teams' },
    { name: 'Healthcare Portal', description: 'Patient management and appointment booking system' },
    { name: 'Learning Management System', description: 'Online course platform with video streaming' },
    { name: 'Food Delivery App', description: 'Restaurant listing and food delivery tracking app' },
    { name: 'Travel Booking Platform', description: 'Flight and hotel booking with itinerary management' },
    { name: 'Social Media Dashboard', description: 'Analytics and scheduling tool for social media' },
    { name: 'Real Estate Platform', description: 'Property listing and virtual tour platform' },
    { name: 'Logistics Tracker', description: 'Shipment tracking and fleet management system' },
    { name: 'Event Management System', description: 'Event planning, ticketing and attendee management' },
    { name: 'Project Management Tool', description: 'Team collaboration and project tracking platform' },
    { name: 'Insurance Portal', description: 'Policy management and claims processing system' },
    { name: 'Fitness Tracking App', description: 'Workout tracking and nutrition management app' },
    { name: 'News Aggregator', description: 'AI-powered news aggregation and personalization platform' },
    { name: 'Video Streaming Platform', description: 'Netflix-like video streaming service' },
    { name: 'Crypto Portfolio Tracker', description: 'Real-time cryptocurrency portfolio management' },
    { name: 'Job Board Platform', description: 'Job listing and applicant tracking system' },
    { name: 'Restaurant POS System', description: 'Point of sale system for restaurants' },
    { name: 'Library Management System', description: 'Book cataloging and borrowing management' },
    { name: 'Chat Application', description: 'Real-time messaging with video calling support' },
    { name: 'Survey Builder', description: 'Drag and drop survey creation and analytics tool' },
    { name: 'Document Management', description: 'Cloud document storage and collaboration platform' },
    { name: 'School Management System', description: 'Student, teacher and curriculum management' },
    { name: 'Expense Tracker', description: 'Personal and team expense management with reports' },
    { name: 'Code Review Tool', description: 'Automated code review and quality analysis platform' },
    { name: 'Marketing Automation', description: 'Email campaign and lead nurturing platform' },
    { name: 'API Gateway Service', description: 'Centralized API management and monitoring system' },
    { name: 'IoT Dashboard', description: 'Real-time IoT device monitoring and control panel' },
    { name: 'Auction Platform', description: 'Online auction system with bidding and payments' },
    { name: 'Legal Case Management', description: 'Law firm case tracking and document management' },
    { name: 'Construction Management', description: 'Project tracking for construction teams' },
    { name: 'Pharmacy Management', description: 'Drug inventory and prescription management system' },
    { name: 'Vehicle Fleet Management', description: 'GPS tracking and maintenance scheduling for fleets' },
    { name: 'Appointment Booking System', description: 'Multi-business appointment scheduling platform' },
    { name: 'Analytics Dashboard', description: 'Business intelligence and data visualization tool' },
    { name: 'Content Management System', description: 'Headless CMS with multi-channel publishing' },
    { name: 'Subscription Billing System', description: 'Recurring billing and subscription management' },
    { name: 'Hotel Management System', description: 'Room booking and housekeeping management' },
    { name: 'Recruitment Platform', description: 'End-to-end hiring and candidate tracking system' },
    { name: 'Supply Chain Management', description: 'Vendor and supply chain visibility platform' },
    { name: 'Telemedicine Platform', description: 'Virtual doctor consultation and prescription system' },
    { name: 'Smart Home Dashboard', description: 'Home automation control and energy monitoring' },
    { name: 'Portfolio Website Builder', description: 'No-code portfolio website creation tool' },
    { name: 'Warehouse Management', description: 'Barcode scanning and warehouse operations system' },
    { name: 'Customer Support System', description: 'Helpdesk ticketing and live chat platform' },
    { name: 'Digital Wallet App', description: 'P2P payments and digital wallet management' },
    { name: 'Feedback Collection Tool', description: 'Customer feedback and NPS tracking platform' },
    { name: 'AI Chatbot Builder', description: 'No-code chatbot creation and deployment platform' },
    { name: 'Compliance Management', description: 'Regulatory compliance tracking and reporting' },
]

const taskTemplates = [
    { title: 'Setup project repository', description: 'Initialize GitHub repo with branch protection rules' },
    { title: 'Design database schema', description: 'Create ER diagram and define all collections/tables' },
    { title: 'Setup CI/CD pipeline', description: 'Configure GitHub Actions for automated deployment' },
    { title: 'Build authentication module', description: 'Implement JWT-based login and signup with refresh tokens' },
    { title: 'Create API documentation', description: 'Write Swagger/Postman documentation for all endpoints' },
    { title: 'Design system setup', description: 'Create reusable UI components and design tokens' },
    { title: 'Implement role-based access', description: 'Setup admin, manager and member role permissions' },
    { title: 'Build dashboard UI', description: 'Create main dashboard with stats and charts' },
    { title: 'Write unit tests', description: 'Achieve 80% code coverage with Jest/Mocha' },
    { title: 'Setup error monitoring', description: 'Integrate Sentry for error tracking and alerts' },
    { title: 'Implement search functionality', description: 'Add full-text search with filters and pagination' },
    { title: 'Build notification system', description: 'Setup email and in-app notifications' },
    { title: 'Create mobile responsive layout', description: 'Ensure all pages work on mobile and tablet' },
    { title: 'Performance optimization', description: 'Improve page load time and API response time' },
    { title: 'Security audit', description: 'Check for XSS, CSRF and SQL injection vulnerabilities' },
    { title: 'Setup logging system', description: 'Implement structured logging with Winston/Morgan' },
    { title: 'Build export functionality', description: 'Add CSV and PDF export for reports' },
    { title: 'Integrate payment gateway', description: 'Setup Razorpay/Stripe for payment processing' },
    { title: 'Create onboarding flow', description: 'Design user onboarding with guided tour' },
    { title: 'Implement file upload', description: 'Add S3/Cloudinary integration for file uploads' },
    { title: 'Build settings module', description: 'Create user and organization settings pages' },
    { title: 'Add dark mode support', description: 'Implement theme switching with CSS variables' },
    { title: 'Create admin panel', description: 'Build admin interface for platform management' },
    { title: 'Setup rate limiting', description: 'Add API rate limiting to prevent abuse' },
    { title: 'Implement data caching', description: 'Setup Redis for caching frequent queries' },
    { title: 'Build activity logs', description: 'Track and display user activity history' },
    { title: 'Create email templates', description: 'Design HTML email templates for notifications' },
    { title: 'Add two-factor authentication', description: 'Implement OTP-based 2FA for security' },
    { title: 'Build analytics module', description: 'Create charts for key business metrics' },
    { title: 'Write integration tests', description: 'Test all API endpoints with Supertest' },
]

const priorities = ['low', 'medium', 'high']
const statuses = ['todo', 'inprogress', 'done']

// Random helpers
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)]
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
const pastDate = () => randomDate(new Date('2026-03-01'), new Date('2026-04-30'))  // overdue
const futureDate = () => randomDate(new Date('2026-05-05'), new Date('2026-07-30'))  // upcoming

// Generate 14 tasks for a project
const generateTasks = (projectId, members, creatorId) => {
    const tasks = []
    const usedTitles = new Set()

    // Shuffle task templates
    const shuffled = [...taskTemplates].sort(() => Math.random() - 0.5)

    for (let i = 0; i < 14; i++) {
        const template = shuffled[i % shuffled.length]
        const title = usedTitles.has(template.title)
            ? `${template.title} (v${i})`
            : template.title
        usedTitles.add(title)

        const status = randomItem(statuses)
        // 30% chance of overdue
        const isOverdue = Math.random() < 0.3
        const dueDate = isOverdue ? pastDate() : futureDate()

        // Assign to random member or null
        const assignedTo = Math.random() < 0.85
            ? randomItem(members).userId
            : null

        tasks.push({
            title,
            description: template.description,
            dueDate,
            priority: randomItem(priorities),
            status,
            projectId,
            assignedTo,
            createdBy: creatorId,
        })
    }

    return tasks
}

// ─── Seed Function ───────────────────────────────────────────────────────────

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('✅ DB connected')

        // Clear existing data
        await User.deleteMany()
        await Project.deleteMany()
        await Task.deleteMany()
        console.log('🗑️  Existing data cleared')

        // ── Create Users ──────────────────────────────────────────────────────────
        const suraj = await User.create({
            name: 'Suraj Patel',
            email: 'suraj@gmail.com',
            password: 'Password123',
            role: 'member'
        })

        const rahul = await User.create({
            name: 'Rahul Shah',
            email: 'rahul@gmail.com',
            password: 'Password123',
            role: 'member'
        })

        const priya = await User.create({
            name: 'Priya Sharma',
            email: 'priya@gmail.com',
            password: 'Password123',
            role: 'member'
        })

        // 16 New Users
        const extraNames = [
            "Aarav Sharma", "Aditi Singh", "Akash Gupta", "Ananya Verma", 
            "Arjun Reddy", "Diya Malhotra", "Ishaan Joshi", "Kavya Nair", 
            "Rohan Mehra", "Sana Khan", "Tanvi Rao", "Vihaan Kapoor", 
            "Zoya Ahmed", "Meera Pillai", "Kabir Bose", "Myra Saxena"
        ];
        
        const extraUsers = [];
        for (const name of extraNames) {
            const firstName = name.split(' ')[0].toLowerCase();
            const user = await User.create({
                name,
                email: `${firstName}${Math.floor(Math.random() * 100)}@gmail.com`,
                password: 'Password123',
                role: 'member'
            });
            extraUsers.push(user);
        }

        console.log('👥 Users created: Suraj, Rahul, Priya + 16 new team members');

        // ── Create Projects ───────────────────────────────────────────────────────

        const coreUsers = [suraj, rahul, priya];
        const allPossibleMembers = [...coreUsers, ...extraUsers];

        const projectOwners = [
            ...Array(15).fill(suraj),   // 15 projects for Suraj
            ...Array(7).fill(rahul),    // 7 projects for Rahul
            ...Array(30).fill(priya),   // 30 projects for Priya
        ]

        let totalTasks = 0
        const allProjects = []

        for (let i = 0; i < 52; i++) {
            const owner = projectOwners[i]
            const template = projectTemplates[i]

            // Pick 9-12 random members for each project (including owner)
            const otherUsers = allPossibleMembers
                .filter(u => !u._id.equals(owner._id))
                .sort(() => Math.random() - 0.5)
                .slice(0, Math.floor(Math.random() * 4) + 9);

            const members = [
                { userId: owner._id, role: 'admin', joinedAt: randomDate(new Date('2026-01-01'), new Date('2026-02-15')) },
                ...otherUsers.map(u => ({
                    userId: u._id,
                    role: 'member',
                    joinedAt: randomDate(new Date('2026-02-16'), new Date('2026-04-30'))
                }))
            ]

            const project = await Project.create({
                name: template.name,
                description: template.description,
                createdBy: owner._id,
                members,
            })

            allProjects.push(project)

            // Generate 14 tasks for this project
            const tasks = generateTasks(project._id, members, owner._id)
            await Task.insertMany(tasks)
            totalTasks += tasks.length
        }

        console.log(`📁 Projects created: 52 total`)
        console.log(`   → Suraj: 15 projects (admin)`)
        console.log(`   → Rahul: 7 projects (admin)`)
        console.log(`   → Priya: 30 projects (admin)`)
        console.log(`✅ Tasks created: ${totalTasks} total (14 per project)`)

        console.log('\n===========================================')
        console.log('🌱 Seed completed successfully!')
        console.log('===========================================')
        console.log('Login credentials (password: Password123):')
        console.log('  Suraj → suraj@gmail.com (admin of 15 projects)')
        console.log('  Rahul → rahul@gmail.com (admin of 7 projects)')
        console.log('  Priya → priya@gmail.com (admin of 30 projects)')
        console.log('===========================================\n')

        process.exit(0)
    } catch (error) {
        console.error('❌ Seed failed:', error)
        process.exit(1)
    }
}

seed()