import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
    ArrowLeft, 
    Calendar, 
    User, 
    MoreHorizontal, 
    CheckCircle2, 
    Circle,
    AlertCircle,
    Loader2,
    Plus,
    Edit2,
    Activity,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Users,
    Shield,
    Mail,
    LogOut,
    UserMinus
} from 'lucide-react';
import api from '../../../services/api';
import { toast } from 'react-toastify';
import CreateTaskModal from '../../components/modals/CreateTaskModal';
import UpdateTaskModal from '../../components/modals/UpdateTaskModal';
import UpdateTaskStatusModal from '../../components/modals/UpdateTaskStatusModal';
import DeleteConfirmModal from '../../components/modals/DeleteConfirmModal';

export default function ProjectDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeMainTab, setActiveMainTab] = useState('tasks');
    const [activeTaskTab, setActiveTaskTab] = useState('all');
    const [taskLoading, setTaskLoading] = useState(false);
    const [members, setMembers] = useState([]);
    const [membersLoading, setMembersLoading] = useState(false);
    
    const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
    const [isUpdateTaskModalOpen, setIsUpdateTaskModalOpen] = useState(false);
    const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [isRemoveMemberModalOpen, setIsRemoveMemberModalOpen] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState(null);
    const [taskToUpdate, setTaskToUpdate] = useState(null);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [taskPage, setTaskPage] = useState(1);
    const [taskPagination, setTaskPagination] = useState({ total: 0, totalPages: 1 });

    const userRole = useMemo(() => {
        if (!project || !user) return 'member';
        const membership = project.members?.find(m => 
            (m.userId?._id || m.userId) === user._id
        );
        return membership?.role || 'member';
    }, [project, user]);

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            const response = await api.patch(`/task/${taskId}/status?projectId=${id}`, { status: newStatus });
            if (response.data.success) {
                setTasks(prev => prev.map(t => t._id === taskId ? response.data.data : t));
                toast.success('Status updated!');
            }
        } catch (error) {
            console.error('Failed to update status', error);
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const handleDeleteTask = (task) => {
        setTaskToDelete(task);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteTask = async () => {
        if (!taskToDelete) return;
        try {
            const response = await api.delete(`/task/${taskToDelete._id}?projectId=${id}`);
            if (response.data.success) {
                toast.success('Task deleted successfully!');
                setIsDeleteModalOpen(false);
                setTaskToDelete(null);
                // If this was the last task on the current page, go back a page
                if (tasks.length === 1 && taskPage > 1) {
                    setTaskPage(taskPage - 1);
                } else {
                    fetchTasks(taskPage);
                }
            }
        } catch (error) {
            console.error('Failed to delete task', error);
            toast.error(error.response?.data?.message || 'Failed to delete task');
        }
    };

    const fetchTasks = async (pageNumber = 1) => {
        setTaskLoading(true);
        try {
            let url = `/task?projectId=${id}&page=${pageNumber}&limit=10`;
            if (activeTaskTab !== 'all') {
                url += `&status=${activeTaskTab}`;
            }
            const tasksRes = await api.get(url);
            if (tasksRes.data.success) {
                setTasks(tasksRes.data.data.tasks);
                setTaskPagination(tasksRes.data.data.pagination);
            }
        } catch (error) {
            console.error('Failed to load tasks', error);
        } finally {
            setTaskLoading(false);
        }
    };

    const fetchMembers = async () => {
        setMembersLoading(true);
        try {
            const response = await api.get(`/project/${id}/members`);
            if (response.data.success) {
                setMembers(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch members', error);
            toast.error('Could not load team members');
        } finally {
            setMembersLoading(false);
        }
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const projectRes = await api.get(`/project/${id}`);
                if (projectRes.data.success) {
                    setProject(projectRes.data.data);
                }
            } catch (error) {
                console.error('Failed to load project details', error);
                if (error.response?.status === 404) navigate('/projects');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchInitialData();
    }, [id, navigate]);

    useEffect(() => {
        if (id && activeMainTab === 'tasks') {
            fetchTasks(taskPage);
        } else if (id && activeMainTab === 'members') {
            fetchMembers();
        }
    }, [id, taskPage, activeTaskTab, activeMainTab]);

    const handleLeaveProject = async () => {
        try {
            const res = await api.delete(`/project/${id}/leave`);
            if (res.data.success) {
                toast.success('You have left the project');
                navigate('/projects');
            }
        } catch (err) {
            console.error('Failed to leave project', err);
            toast.error(err.response?.data?.message || 'Could not leave project');
        } finally {
            setIsLeaveModalOpen(false);
        }
    };

    const handleRemoveMember = async () => {
        if (!memberToRemove) return;
        try {
            const res = await api.delete(`/project/${id}/members/${memberToRemove.userId?._id || memberToRemove.userId}`);
            if (res.data.success) {
                toast.success('Member removed successfully');
                fetchMembers();
            }
        } catch (err) {
            console.error('Failed to remove member', err);
            toast.error(err.response?.data?.message || 'Could not remove member');
        } finally {
            setIsRemoveMemberModalOpen(false);
            setMemberToRemove(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <Loader2 className="w-8 h-8 text-[#0F172A] animate-spin" />
            </div>
        );
    }

    if (!project) return null;

    const getStatusIcon = (status) => {
        switch (status) {
            case 'done': return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
            case 'inprogress': return <MoreHorizontal className="w-4 h-4 text-blue-600" />;
            case 'todo': default: return <Circle className="w-4 h-4 text-slate-400" />;
        }
    };

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'high': 
                return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-700">High</span>;
            case 'medium': 
                return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-700">Medium</span>;
            case 'low': default: 
                return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700">Low</span>;
        }
    };

    return (
        <div className="max-w-[1400px] mx-auto px-8 py-8 animate-in fade-in duration-500 font-sans text-slate-900">
            {/* Header / Nav */}
            <div className="flex items-center justify-between mb-6">
                <button 
                    onClick={() => navigate('/projects')}
                    className="flex items-center gap-2 text-[13px] font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Projects
                </button>

                {project.createdBy?._id !== user?._id && project.createdBy !== user?._id && (
                    <button 
                        onClick={() => setIsLeaveModalOpen(true)}
                        className="flex items-center gap-2 text-[13px] font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        Leave Project
                    </button>
                )}
            </div>

            <div className="bg-white border border-slate-200 rounded-[16px] p-8 shadow-sm mb-8">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div>
                        <h1 className="text-[28px] font-bold tracking-tight text-slate-900 leading-tight mb-2">
                            {project.name}
                        </h1>
                        <p className="text-[15px] text-slate-600 max-w-3xl leading-relaxed">
                            {project.description || "No description provided for this project."}
                        </p>
                    </div>
                    
                    <div className="flex flex-col gap-3 min-w-[200px]">
                        <div className="flex items-center justify-between text-[13px] border-b border-slate-100 pb-2">
                            <span className="text-slate-500 font-medium">Created</span>
                            <span className="font-bold text-slate-900">
                                {new Date(project.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-[13px] border-b border-slate-100 pb-2">
                            <span className="text-slate-500 font-medium">Creator</span>
                            <span className="font-bold text-slate-900">
                                {project.createdBy?.name || 'Unknown'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-[13px]">
                            <span className="text-slate-500 font-medium">Members</span>
                            <span className="font-bold text-slate-900">
                                {project.members?.length || 0}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Tabs */}
            <div className="flex items-center gap-1 mb-8 border-b border-slate-200">
                <button
                    onClick={() => setActiveMainTab('tasks')}
                    className={`px-6 py-3 text-[14px] font-bold transition-all border-b-2 -mb-[2px] flex items-center gap-2 ${
                        activeMainTab === 'tasks'
                            ? 'border-[#0F172A] text-[#0F172A]'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <Activity className="w-4 h-4" />
                    Tasks
                </button>
                <button
                    onClick={() => setActiveMainTab('members')}
                    className={`px-6 py-3 text-[14px] font-bold transition-all border-b-2 -mb-[2px] flex items-center gap-2 ${
                        activeMainTab === 'members'
                            ? 'border-[#0F172A] text-[#0F172A]'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <Users className="w-4 h-4" />
                    Team Members
                </button>
            </div>

            {activeMainTab === 'tasks' ? (
                <>
                    {/* Tasks Section Header */}
                    <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                                <h2 className="text-[20px] font-bold text-slate-900">Tasks</h2>
                                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[12px] font-bold">
                                    {taskPagination.total} Total
                                </span>
                            </div>
                            
                            {/* Task Sub-Tabs */}
                            <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-lg ml-2">
                                {[
                                    { id: 'all', label: 'All' },
                                    { id: 'todo', label: 'Todo' },
                                    { id: 'inprogress', label: 'In Progress' },
                                    { id: 'done', label: 'Completed' }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            setActiveTaskTab(tab.id);
                                            setTaskPage(1);
                                        }}
                                        className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                                            activeTaskTab === tab.id
                                                ? 'bg-white text-[#0F172A] shadow-sm'
                                                : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {userRole === 'admin' && (
                            <button 
                                onClick={() => setIsCreateTaskModalOpen(true)}
                                className="bg-[#0F172A] text-white px-5 py-2.5 rounded-[8px] text-[13px] font-semibold flex items-center gap-2 shadow-sm hover:opacity-90 transition-colors self-start md:self-auto"
                            >
                                <Plus className="w-4 h-4" />
                                Create Task
                            </button>
                        )}
                    </div>

                    {taskLoading ? (
                        <div className="flex items-center justify-center py-20 bg-white border border-slate-200 rounded-[16px]">
                            <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
                        </div>
                    ) : tasks.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-[16px] p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-[18px] font-bold text-slate-900 mb-2">No tasks found</h3>
                    <p className="text-[14px] text-slate-500">
                        This project doesn't have any tasks assigned to it yet.
                    </p>
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-[16px] shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-[40%]">Task Name</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Priority</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Assignee</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Due Date</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Completed</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {tasks.map((task) => (
                                    <tr key={task._id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                                        <td className="px-6 py-4">
                                            <p className="text-[14px] font-bold text-slate-800 mb-1">{task.title}</p>
                                            {task.description && (
                                                <p className="text-[12px] text-slate-500 line-clamp-1">{task.description}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(task.status)}
                                                <select
                                                    value={task.status}
                                                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className={`text-[12px] font-semibold rounded-full px-2 py-1 border-0 outline-none cursor-pointer appearance-none ${
                                                        task.status === 'done'
                                                            ? 'bg-emerald-50 text-emerald-700'
                                                            : task.status === 'inprogress'
                                                            ? 'bg-blue-50 text-blue-700'
                                                            : 'bg-slate-100 text-slate-600'
                                                    }`}
                                                >
                                                    <option value="todo">Todo</option>
                                                    <option value="inprogress">In Progress</option>
                                                    <option value="done">Done</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getPriorityBadge(task.priority)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[13px] font-medium text-slate-600">
                                                {task.assignedTo?.name || 'Unassigned'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-[13px] font-medium text-slate-500">
                                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {task.status === 'done' && task.completedAt ? (
                                                <span className="text-[13px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                                                    {new Date(task.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </span>
                                            ) : (
                                                <span className="text-slate-300 text-[13px]">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {userRole === 'admin' ? (
                                                <div className="flex items-center justify-end gap-1">
                                                    {/* Update Status */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setTaskToUpdate(task);
                                                            setIsUpdateStatusModalOpen(true);
                                                        }}
                                                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                                                        title="Update Status"
                                                    >
                                                        <Activity className="w-4 h-4" />
                                                    </button>
                                                    {/* Update Full Task */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setTaskToUpdate(task);
                                                            setIsUpdateTaskModalOpen(true);
                                                        }}
                                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                        title="Edit Task"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    {/* Delete Task */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteTask(task);
                                                        }}
                                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                        title="Delete Task"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : task.assignedTo?._id === user?._id && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setTaskToUpdate(task);
                                                        setIsUpdateStatusModalOpen(true);
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                                                    title="Update Status"
                                                >
                                                    <Activity className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

                    {/* Task Pagination */}
                    <div className="mt-6 flex items-center justify-between">
                        <p className="text-[13px] text-slate-500">
                            Showing <span className="font-bold text-slate-700">{taskPagination.total > 0 ? (taskPage - 1) * 10 + 1 : 0}–{Math.min(taskPage * 10, taskPagination.total)}</span> of <span className="font-bold text-slate-700">{taskPagination.total}</span> tasks
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setTaskPage(p => Math.max(1, p - 1))}
                                disabled={taskPage === 1}
                                className="p-2 rounded-[8px] border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {Array.from({ length: taskPagination.totalPages || 1 }, (_, i) => i + 1).map((pg) => (
                                <button
                                    key={pg}
                                    onClick={() => setTaskPage(pg)}
                                    className={`w-9 h-9 rounded-[8px] text-[13px] font-bold transition-colors ${
                                        pg === taskPage
                                            ? 'bg-[#0F172A] text-white'
                                            : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    {pg}
                                </button>
                            ))}
                            <button
                                onClick={() => setTaskPage(p => Math.min(taskPagination.totalPages || 1, p + 1))}
                                disabled={taskPage === (taskPagination.totalPages || 1)}
                                className="p-2 rounded-[8px] border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                /* Members Tab Content */
                <div className="bg-white border border-slate-200 rounded-[16px] shadow-sm overflow-hidden">
                    {membersLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Member</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                                        {userRole === 'admin' && (
                                            <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {members.map((member) => {
                                        const isCurrentUser = (member.userId?._id || member.userId) === user?._id;
                                        const isCreator = project.createdBy?._id === (member.userId?._id || member.userId) || project.createdBy === (member.userId?._id || member.userId);
                                        
                                        return (
                                            <tr key={member.userId?._id || member._id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[14px] font-bold text-slate-600">
                                                            {member.userId?.name?.charAt(0) || '?'}
                                                        </div>
                                                        <div>
                                                            <p className="text-[14px] font-bold text-slate-900">{member.userId?.name || 'Unknown'}</p>
                                                            {isCurrentUser && (
                                                                <span className="text-[10px] text-blue-600 font-bold uppercase">You</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2 text-slate-500">
                                                        <Mail className="w-3.5 h-3.5" />
                                                        <span className="text-[13px]">{member.userId?.email || 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${member.role === 'admin' ? 'bg-indigo-500' : 'bg-slate-400'}`}></div>
                                                        <span className={`text-[12px] font-bold uppercase tracking-wider ${
                                                            member.role === 'admin' ? 'text-indigo-600' : 'text-slate-500'
                                                        }`}>
                                                            {member.role}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <p className="text-[13px] text-slate-500">
                                                        {new Date(member.joinedAt).toLocaleDateString()}
                                                    </p>
                                                </td>
                                                {userRole === 'admin' && (
                                                    <td className="px-6 py-5 text-right">
                                                        {!isCurrentUser && !isCreator && (
                                                            <button 
                                                                onClick={() => {
                                                                    setMemberToRemove(member);
                                                                    setIsRemoveMemberModalOpen(true);
                                                                }}
                                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                                title="Remove Member"
                                                            >
                                                                <UserMinus className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            <CreateTaskModal 
                isOpen={isCreateTaskModalOpen}
                onClose={() => setIsCreateTaskModalOpen(false)}
                projectId={id}
                projectMembers={project.members}
                onTaskCreated={(newTask) => {
                    setTaskPage(1);
                    fetchTasks(1);
                }}
            />

            <UpdateTaskModal 
                isOpen={isUpdateTaskModalOpen}
                onClose={() => setIsUpdateTaskModalOpen(false)}
                task={taskToUpdate}
                projectId={id}
                projectMembers={project.members}
                onTaskUpdated={(updatedTask) => {
                    setTasks(tasks.map(t => t._id === updatedTask._id ? updatedTask : t));
                }}
            />

            <UpdateTaskStatusModal
                isOpen={isUpdateStatusModalOpen}
                onClose={() => setIsUpdateStatusModalOpen(false)}
                task={taskToUpdate}
                projectId={id}
                onTaskUpdated={(updatedTask) => {
                    setTasks(tasks.map(t => t._id === updatedTask._id ? updatedTask : t));
                    setIsUpdateStatusModalOpen(false);
                }}
            />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setTaskToDelete(null);
                }}
                onConfirm={confirmDeleteTask}
                title="Delete Task"
                itemName={taskToDelete?.title || ''}
                confirmLabel="Delete Task"
            />

            <DeleteConfirmModal
                isOpen={isLeaveModalOpen}
                onClose={() => setIsLeaveModalOpen(false)}
                onConfirm={handleLeaveProject}
                title="Leave Project"
                itemName={project.name}
                confirmLabel="Leave Project"
            />

            <DeleteConfirmModal
                isOpen={isRemoveMemberModalOpen}
                onClose={() => {
                    setIsRemoveMemberModalOpen(false);
                    setMemberToRemove(null);
                }}
                onConfirm={handleRemoveMember}
                title="Remove Member"
                itemName={memberToRemove?.userId?.name || ''}
                confirmLabel="Remove Member"
            />
        </div>
    );
}
