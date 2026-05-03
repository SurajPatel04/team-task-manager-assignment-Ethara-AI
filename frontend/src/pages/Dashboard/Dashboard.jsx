import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
} from 'recharts';
import CreateProjectModal from '../../components/modals/CreateProjectModal';
import CreateTaskModal from '../../components/modals/CreateTaskModal';
import { 
    ListTodo, 
    Circle, 
    MoreHorizontal, 
    AlertTriangle,
    Plus,
    FileText,
    UserPlus,
    CalendarX2,
    ChevronLeft,
    ChevronRight,
    Users
} from 'lucide-react';
import api from '../../../services/api';
import { toast } from 'react-toastify';

const COLORS = {
    done: '#059669',       // Green
    inprogress: '#1D4ED8', // Blue
    todo: '#CBD5E1',       // Light Grey
};

export default function Dashboard() {
    const { user } = useSelector((state) => state.auth);
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [projectPage, setProjectPage] = useState(1);
    const [projectPagination, setProjectPagination] = useState({ totalPages: 1, total: 0 });
    const [projectLoadingMore, setProjectLoadingMore] = useState(false);
    const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
    
    const [stats, setStats] = useState({ total: 0, todo: 0, inprogress: 0, done: 0, overdue: 0 });
    const [dashboardTasks, setDashboardTasks] = useState([]);
    const [dashboardPage, setDashboardPage] = useState(1);
    const [dashboardPagination, setDashboardPagination] = useState({ total: 0, totalPages: 1 });
    const [activeTab, setActiveTab] = useState('critical');
    const [taskCache, setTaskCache] = useState({}); // { 'projectId-tab-page': { tasks, pagination } }
    const [userTasks, setUserTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(false);
    const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
    const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

    // Determine the user's role in the currently selected project
    const userProjectRole = useMemo(() => {
        if (!selectedProjectId || !projects.length || !user) return 'member';
        
        const currentProject = projects.find(p => p._id === selectedProjectId);
        if (!currentProject) return 'member';
        
        const membership = currentProject.members.find(m => 
            (m.userId._id || m.userId) === user._id
        );
        
        return membership?.role || 'member';
    }, [selectedProjectId, projects, user]);

    const isAdmin = userProjectRole === 'admin';

    const fetchProjects = useCallback(async (page = 1, append = false) => {
        if (page > 1) setProjectLoadingMore(true);
        try {
            const response = await api.get(`/project?page=${page}&limit=20`);
            if (response.data.success) {
                const projectList = response.data.data.projects;
                const pagination = response.data.data.pagination;
                
                setProjects(prev => append ? [...prev, ...projectList] : projectList);
                setProjectPagination(pagination);
                
                if (page === 1 && projectList.length > 0 && !selectedProjectId) {
                    setSelectedProjectId(projectList[0]._id);
                }
            }
        } catch (err) {
            console.error('Failed to fetch projects', err);
            toast.error('Could not load projects');
        } finally {
            setLoading(false);
            setProjectLoadingMore(false);
        }
    }, [selectedProjectId]);

    const handleLoadMoreProjects = () => {
        if (projectPage < projectPagination.totalPages && !projectLoadingMore) {
            const nextPage = projectPage + 1;
            setProjectPage(nextPage);
            fetchProjects(nextPage, true);
        }
    };

    const fetchStats = async (projectId) => {
        try {
            const res = await api.get(`/dashboard/stats?projectId=${projectId}`);
            if (res.data.success && res.data.data) {
                setStats(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch stats', err);
        }
    };

    const fetchDashboardTasks = async (projectId, tab = 'critical', page = 1) => {
        const cacheKey = `${projectId}-${tab}-${page}`;
        
        // Check cache first
        if (taskCache[cacheKey]) {
            setDashboardTasks(taskCache[cacheKey].tasks);
            setDashboardPagination(taskCache[cacheKey].pagination);
            return;
        }

        try {
            const res = await api.get(`/dashboard/tasks?projectId=${projectId}&tab=${tab}&page=${page}&limit=5`);
            if (res.data.success && res.data.data) {
                const tasks = res.data.data.tasks || [];
                const pagination = res.data.data.pagination || { total: 0, totalPages: 1 };
                
                setDashboardTasks(tasks);
                setDashboardPagination(pagination);
                
                // Update cache
                setTaskCache(prev => ({
                    ...prev,
                    [cacheKey]: { tasks, pagination }
                }));

                // If it's the critical tab, update the overdue count in stats
                if (tab === 'critical') {
                    setStats(prev => ({ ...prev, overdue: pagination.total }));
                }
            }
        } catch (err) {
            console.error(`Failed to fetch ${tab} tasks`, err);
        }
    };

    const fetchUserTasks = async (projectId) => {
        try {
            const userTasksRes = await api.get(`/dashboard/user-tasks?projectId=${projectId}`);
            if (userTasksRes.data.success && userTasksRes.data.data) {
                const processedData = userTasksRes.data.data.map((item, index) => {
                    const shades = [
                        '#0F172A', '#1E293B', '#334155', '#475569', 
                        '#64748B', '#94A3B8', '#1D4ED8', '#2563EB'
                    ]; // Dark Navy to Slate to Blue
                    let color = shades[index % shades.length];
                    if (!item.user) color = '#CBD5E1'; // Light Slate for unassigned
                    
                    return {
                        ...item,
                        userName: item.user?.name?.split(' ')[0] || 'Unassigned',
                        totalWork: item.todo + item.inprogress + item.done,
                        fillColor: color
                    };
                });
                setUserTasks(processedData);
            }
        } catch (err) {
            console.error('Failed to fetch user tasks', err);
        }
    };

    const fetchDashboardData = useCallback(async (projectId, role) => {
        if (!projectId) return;
        setStatsLoading(true);
        try {
            // Use Promise.all to fetch all data simultaneously
            const promises = [
                fetchStats(projectId),
                fetchDashboardTasks(projectId, activeTab, 1)
            ];

            if (role === 'admin') {
                promises.push(fetchUserTasks(projectId));
            } else {
                setUserTasks([]);
            }

            await Promise.all(promises);
            setDashboardPage(1); // Reset page on project change
            setTaskCache({}); // Clear cache on project change to ensure fresh data
        } catch (err) {
            console.error('Failed to fetch dashboard data', err);
            toast.error('Error loading dashboard data');
        } finally {
            setStatsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedProjectId) {
            fetchDashboardTasks(selectedProjectId, activeTab, dashboardPage);
        }
    }, [dashboardPage, selectedProjectId, activeTab]);

    useEffect(() => {
        fetchProjects(1);
    }, []);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.project-dropdown-container')) {
                setIsProjectDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (selectedProjectId) {
            fetchDashboardData(selectedProjectId, userProjectRole);
        }
    }, [selectedProjectId, userProjectRole, fetchDashboardData]);

    if (loading) {
        return <DashboardSkeleton />;
    }

    if (projects.length === 0) {
        return (
            <>
                <EmptyProjectsState onOpenCreateModal={() => setIsCreateProjectOpen(true)} />
                <CreateProjectModal 
                    isOpen={isCreateProjectOpen} 
                    onClose={() => setIsCreateProjectOpen(false)} 
                    onProjectCreated={(newProject) => {
                        setProjects(prev => [...prev, newProject]);
                        setSelectedProjectId(newProject._id);
                    }}
                />
            </>
        );
    }

    // Pie chart data
    const pieData = [
        { name: 'Done', value: stats.done || 0, color: COLORS.done },
        { name: 'In Progress', value: stats.inprogress || 0, color: COLORS.inprogress },
        { name: 'Todo', value: stats.todo || 0, color: COLORS.todo }
    ];

    return (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-6 sm:py-8 animate-in fade-in duration-500 font-sans text-slate-900">
            {/* Header & Selector */}
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-[26px] font-bold tracking-tight text-slate-900 leading-tight">Project Overview</h1>
                    <p className="text-[14px] text-slate-500 mt-1">Analytics and team performance at a glance</p>
                </div>
                
                <div className="relative project-dropdown-container w-full md:w-auto">
                    <button
                        onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                        className="flex items-center justify-between bg-white border border-slate-200 rounded-[8px] text-[13px] font-semibold text-slate-700 py-2.5 px-4 outline-none cursor-pointer hover:border-slate-300 shadow-sm transition-all w-full md:min-w-[240px]"
                    >
                        <span className="truncate">
                            {projects.find(p => p._id === selectedProjectId)?.name || 'Select Project'}
                        </span>
                        <svg className={`fill-current h-4 w-4 transition-transform duration-200 ${isProjectDropdownOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                        </svg>
                    </button>

                    {isProjectDropdownOpen && (
                        <div className="absolute top-full right-0 mt-1 w-full md:min-w-[240px] bg-white border border-slate-200 rounded-[8px] shadow-lg z-50 max-h-[300px] overflow-y-auto custom-scrollbar"
                             onScroll={(e) => {
                                 const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                                 if (scrollHeight - scrollTop <= clientHeight + 10) {
                                     handleLoadMoreProjects();
                                 }
                             }}>
                            {projects.map(p => {
                                const membership = p.members?.find(m => (m.userId._id || m.userId) === user?._id);
                                const role = membership?.role === 'admin' ? 'Admin' : 'Member';
                                
                                return (
                                    <div
                                        key={p._id}
                                        onClick={() => {
                                            setSelectedProjectId(p._id);
                                            setIsProjectDropdownOpen(false);
                                        }}
                                        className={`px-4 py-2.5 text-[13px] cursor-pointer transition-colors flex items-center justify-between ${
                                            p._id === selectedProjectId 
                                                ? 'bg-slate-50 text-[#0F172A] font-bold' 
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                    >
                                        <span className="truncate">{p.name}</span>
                                        <span className={`text-[10px] font-bold uppercase ml-2 px-2 py-0.5 rounded-full ${
                                            role === 'Admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-500'
                                        }`}>
                                            {role}
                                        </span>
                                    </div>
                                );
                            })}
                            {projectLoadingMore && (
                                <div className="px-4 py-2 text-[11px] text-center text-slate-400">
                                    Loading more...
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-row items-center gap-2 sm:gap-3 mb-8 overflow-x-auto no-scrollbar pb-1">
                <button 
                    onClick={() => setIsCreateProjectOpen(true)}
                    className="bg-[#0F172A] text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-[8px] text-[12px] sm:text-[13px] font-semibold flex items-center gap-1.5 sm:gap-2 shadow-sm hover:opacity-90 transition-colors whitespace-nowrap"
                >
                    <Plus className="w-3.5 h-3.5 sm:w-4 h-4" />
                    Create Project
                </button>
                {userProjectRole === 'admin' && (
                    <button 
                        onClick={() => {
                            if (!selectedProjectId) {
                                toast.warning('Please select a project first');
                                return;
                            }
                            setIsCreateTaskModalOpen(true);
                        }}
                        className="bg-white border border-[#0F172A] text-[#0F172A] px-3 sm:px-5 py-2 sm:py-2.5 rounded-[8px] text-[12px] sm:text-[13px] font-semibold flex items-center gap-1.5 sm:gap-2 shadow-sm hover:bg-slate-50 transition-colors whitespace-nowrap"
                    >
                        <FileText className="w-3.5 h-3.5 sm:w-4 h-4" />
                        Create Task
                    </button>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8">
                <StatCard 
                    label="TOTAL TASKS" 
                    value={stats.total} 
                    loading={statsLoading}
                    icon={<ListTodo className="w-5 h-5 text-blue-800" strokeWidth={2.5}/>} 
                    iconBg="bg-blue-50"
                />
                <StatCard 
                    label="TODO" 
                    value={stats.todo} 
                    loading={statsLoading}
                    icon={<Circle className="w-5 h-5 text-slate-600" strokeWidth={2.5}/>} 
                    iconBg="bg-slate-100"
                />
                <StatCard 
                    label="IN PROGRESS" 
                    value={stats.inprogress} 
                    loading={statsLoading}
                    icon={<MoreHorizontal className="w-5 h-5 text-emerald-600" strokeWidth={2.5}/>} 
                    iconBg="bg-emerald-50"
                    highlightBorder="border-l-4 border-l-emerald-600"
                />
                <StatCard 
                    label="OVERDUE TASKS" 
                    value={stats.overdue} 
                    loading={statsLoading}
                    icon={<AlertTriangle className="w-5 h-5 text-red-600" strokeWidth={2.5}/>} 
                    iconBg="bg-red-50"
                    highlightBorder="border-l-4 border-l-red-600 shadow-[0_0_15px_rgba(220,38,38,0.1)]"
                    isAlert={true}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Status Pie Chart */}
                <div className="bg-white p-7 rounded-[16px] border border-slate-200 shadow-sm flex flex-col min-h-[420px]">
                    <h3 className="font-bold text-[16px] text-slate-900 mb-8">Status Distribution</h3>
                    <div className="flex-grow flex flex-col relative">
                        {statsLoading ? (
                             <div className="w-48 h-48 mx-auto rounded-full border-8 border-slate-50 border-t-blue-600 animate-spin mt-4"></div>
                        ) : stats.total > 0 ? (
                            <>
                                <div className="relative h-[220px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                innerRadius={75}
                                                outerRadius={105}
                                                paddingAngle={2}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    {/* Center Text */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-3xl font-bold text-slate-900">{stats.total}</span>
                                        <span className="text-[10px] font-bold text-slate-400 tracking-wider">TOTAL</span>
                                    </div>
                                </div>
                                {/* Custom Legend */}
                                <div className="mt-8 flex flex-col gap-3 px-4">
                                    {pieData.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                                <span className="text-slate-600 font-medium">{item.name}</span>
                                            </div>
                                            <span className="font-bold text-slate-900">
                                                {item.value} <span className="text-slate-400 font-normal text-xs ml-1">({Math.round((item.value / stats.total) * 100)}%)</span>
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <NoDataState message="No tasks created yet" />
                        )}
                    </div>
                </div>

                {/* Team Workload Chart (Admin Only) */}
                <div className="bg-white p-7 rounded-[16px] border border-slate-200 shadow-sm lg:col-span-2 flex flex-col min-h-[420px]">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-bold text-[16px] text-slate-900">Team Workload</h3>
                    </div>
                    
                    <div className="flex-grow overflow-x-auto no-scrollbar">
                        {!isAdmin ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <AlertTriangle className="w-8 h-8 text-slate-400 mb-3" />
                                <p className="text-slate-600 font-semibold">Restricted Access</p>
                                <p className="text-sm text-slate-500 mt-1">This analytic is only available for Project Administrators.</p>
                            </div>
                        ) : statsLoading ? (
                             <div className="h-full flex items-end justify-around pb-8 pt-12">
                                {[1,2,3,4,5,6].map(i => (
                                    <div key={i} className={`w-12 bg-slate-100 rounded-t-sm animate-pulse`} style={{ height: `${Math.random() * 60 + 20}%` }}></div>
                                ))}
                             </div>
                        ) : userTasks.length > 0 ? (
                            <div style={{ minWidth: Math.max(500, userTasks.length * 70) }}>
                                <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={userTasks} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="userName" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 13, fill: '#64748b' }} 
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 13, fill: '#94a3b8' }} 
                                    />
                                    <RechartsTooltip 
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar 
                                        dataKey="totalWork" 
                                        name="Tasks" 
                                        radius={[4, 4, 0, 0]} 
                                        barSize={40} 
                                    >
                                        {userTasks.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fillColor} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                            </div>
                        ) : (
                            <NoDataState message="No team data found" />
                        )}
                    </div>
                </div>
            </div>

            {/* Overdue Tasks Table */}
            <div className="bg-white rounded-[16px] border border-slate-200 shadow-sm overflow-hidden mb-8">
                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                                <CalendarX2 className="w-4 h-4 sm:w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-[15px] sm:text-[17px] font-bold text-slate-900">Task Overview</h3>
                                <p className="text-[11px] sm:text-[13px] text-slate-500">Monitor deadlines and team progress</p>
                            </div>
                        </div>

                        {/* Tab Switcher */}
                        <div className="flex items-center bg-slate-100 p-1 rounded-lg self-start overflow-x-auto no-scrollbar max-w-full">
                            {[
                                { id: 'critical', label: 'Critical', icon: AlertTriangle },
                                { id: 'todo', label: 'To Do', icon: ListTodo },
                                { id: 'inprogress', label: 'In Progress', icon: Circle },
                                { id: 'completed', label: 'Completed', icon: FileText },
                                { id: 'assigned', label: 'Assigned', icon: UserPlus },
                                { id: 'unassigned', label: 'Unassigned', icon: Users }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        setDashboardPage(1);
                                    }}
                                    className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md text-[11px] sm:text-[12px] font-bold transition-all whitespace-nowrap ${
                                        activeTab === tab.id
                                            ? 'bg-white text-[#0F172A] shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    <tab.icon className={`w-3 sm:w-3.5 h-3 sm:h-3.5 ${activeTab === tab.id ? 'text-red-500' : ''}`} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {statsLoading ? (
                        <TableSkeleton />
                    ) : dashboardTasks.length > 0 ? (
                        <>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">Task Name</th>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">Assignee</th>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">{activeTab === 'completed' ? 'Completed' : 'Deadline'}</th>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">Priority</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {dashboardTasks.map(task => (
                                        <tr key={task._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                <p className="text-[13px] sm:text-[14px] text-slate-700 font-medium line-clamp-1">{task.title}</p>
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-white shrink-0 ${task.assignedTo ? 'bg-[#0F172A]' : 'bg-slate-400'}`}>
                                                        {task.assignedTo?.name?.charAt(0)?.toUpperCase() || '?'}
                                                    </div>
                                                    <p className="text-[12px] sm:text-[13px] text-slate-600 truncate">{task.assignedTo?.name?.split(' ')[0] || 'Unassigned'}</p>
                                                </div>
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                <span className={`text-[12px] sm:text-[13px] whitespace-nowrap ${
                                                    activeTab === 'critical' ? 'text-red-600' : 
                                                    activeTab === 'completed' ? 'text-emerald-600 font-medium' :
                                                    'text-slate-600'
                                                }`}>
                                                    {activeTab === 'completed' && task.completedAt
                                                        ? new Date(task.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                                        : new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                                    }
                                                </span>
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                <span className={`text-[10px] sm:text-[11px] font-bold uppercase px-2 sm:px-3 py-0.5 sm:py-1 rounded-full ${
                                                    task.priority === 'high' ? 'bg-red-100 text-red-700' :
                                                    task.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-slate-100 text-slate-700'
                                                }`}>
                                                    {task.priority}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {/* Pagination */}
                            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <p className="text-[11px] sm:text-[12px] text-slate-500">
                                    <span className="hidden xs:inline">Showing </span><span className="font-bold text-slate-700">{(dashboardPage - 1) * 5 + 1}–{Math.min(dashboardPage * 5, dashboardPagination.total)}</span><span className="hidden xs:inline"> of </span><span className="font-bold text-slate-700 xs:hidden">/</span><span className="font-bold text-slate-700">{dashboardPagination.total}</span>
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setDashboardPage(p => Math.max(1, p - 1))}
                                        disabled={dashboardPage === 1}
                                        className="p-1.5 rounded-md border border-slate-200 text-slate-400 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="text-[12px] font-bold text-slate-700 mx-1">Page {dashboardPage}</span>
                                    <button
                                        onClick={() => setDashboardPage(p => Math.min(dashboardPagination.totalPages, p + 1))}
                                        disabled={dashboardPage === dashboardPagination.totalPages}
                                        className="p-1.5 rounded-md border border-slate-200 text-slate-400 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-slate-300" />
                            </div>
                            <h4 className="text-lg font-bold text-slate-900">No {activeTab} tasks</h4>
                            <p className="text-sm text-slate-500 mt-1">There are no tasks to display in this category.</p>
                        </div>
                    )}
                </div>
            </div>
            
            <CreateProjectModal 
                isOpen={isCreateProjectOpen} 
                onClose={() => setIsCreateProjectOpen(false)} 
                onProjectCreated={(newProject) => {
                    setProjects(prev => [...prev, newProject]);
                    setSelectedProjectId(newProject._id);
                }}
            />

            <CreateTaskModal 
                isOpen={isCreateTaskModalOpen}
                onClose={() => setIsCreateTaskModalOpen(false)}
                projectId={selectedProjectId}
                projectMembers={projects.find(p => p._id === selectedProjectId)?.members || []}
                onTaskCreated={() => {
                    // Refresh dashboard data when a new task is created
                    if (selectedProjectId) {
                        fetchDashboardData(selectedProjectId, userProjectRole);
                    }
                }}
            />
        </div>
    );
}

function StatCard({ label, value, icon, iconBg, loading, highlightBorder, isAlert }) {
    return (
        <div className={`bg-white p-4 sm:p-6 rounded-[12px] sm:rounded-[16px] border border-slate-200 shadow-sm flex items-center justify-between transition-all hover:shadow-md ${highlightBorder || ''}`}>
            <div>
                <p className="text-[9px] sm:text-[11px] font-bold text-slate-500 tracking-wider mb-0.5 sm:mb-1 uppercase">{label}</p>
                {loading ? (
                    <div className="h-6 sm:h-8 w-10 sm:w-12 bg-slate-100 rounded animate-pulse"></div>
                ) : (
                    <h3 className={`text-[20px] sm:text-[28px] font-bold tracking-tight ${isAlert ? 'text-red-600' : 'text-slate-900'}`}>{value}</h3>
                )}
            </div>
            <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-[8px] sm:rounded-[12px] ${iconBg} flex items-center justify-center shrink-0`}>
                <div className="scale-75 sm:scale-100">
                    {icon}
                </div>
            </div>
        </div>
    );
}

function NoDataState({ message }) {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 w-full h-[200px]">
            <p className="text-slate-400 font-semibold text-sm">{message || 'No data available'}</p>
        </div>
    );
}

function EmptyProjectsState({ onOpenCreateModal }) {
    return (
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Your workspace is empty</h2>
            <p className="text-slate-500 mb-8 text-lg">Create a project to start tracking your team's progress.</p>
            <button 
                onClick={onOpenCreateModal}
                className="bg-[#0F172A] text-white px-8 py-3 rounded-[8px] font-bold hover:opacity-90 transition-all"
            >
                Create My First Project
            </button>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="max-w-[1400px] mx-auto px-8 py-8">
            <div className="flex justify-between items-start mb-6">
                <div className="space-y-3">
                    <div className="h-8 w-64 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-4 w-48 bg-slate-100 rounded animate-pulse"></div>
                </div>
                <div className="h-10 w-48 bg-slate-200 rounded animate-pulse"></div>
            </div>
            <div className="flex gap-3 mb-8">
                <div className="h-10 w-32 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-10 w-32 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-10 w-32 bg-slate-200 rounded animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[1,2,3,4].map(i => (
                    <div key={i} className="h-28 bg-white border border-slate-200 rounded-[12px] animate-pulse"></div>
                ))}
            </div>
        </div>
    );
}

function TableSkeleton() {
    return (
        <div className="p-6 space-y-4">
            {[1,2,3].map(i => (
                <div key={i} className="flex justify-between items-center py-3 border-b border-slate-100">
                    <div className="h-4 w-48 bg-slate-100 rounded animate-pulse"></div>
                    <div className="h-6 w-24 bg-slate-100 rounded-full animate-pulse"></div>
                    <div className="h-4 w-24 bg-slate-100 rounded animate-pulse"></div>
                    <div className="h-6 w-16 bg-slate-100 rounded-full animate-pulse"></div>
                </div>
            ))}
        </div>
    );
}
