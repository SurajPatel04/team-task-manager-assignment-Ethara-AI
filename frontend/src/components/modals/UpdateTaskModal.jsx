import { useState, useEffect } from 'react';
import { X, Loader2, Calendar as CalendarIcon, User, Flag, Activity } from 'lucide-react';
import api from '../../../services/api';
import { toast } from 'react-toastify';

export default function UpdateTaskModal({ isOpen, onClose, task, projectId, projectMembers = [], onTaskUpdated }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState('medium');
    const [status, setStatus] = useState('todo');
    const [assignedTo, setAssignedTo] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && task) {
            setTitle(task.title || '');
            setDescription(task.description || '');
            
            // Format date for date input (YYYY-MM-DD)
            if (task.dueDate) {
                const dateObj = new Date(task.dueDate);
                const year = dateObj.getFullYear();
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const day = String(dateObj.getDate()).padStart(2, '0');
                setDueDate(`${year}-${month}-${day}`);
            } else {
                setDueDate('');
            }
            
            setPriority(task.priority || 'medium');
            setStatus(task.status || 'todo');
            setAssignedTo(task.assignedTo?._id || task.assignedTo || '');
            
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, task]);

    if (!isOpen || !task) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!title.trim()) {
            toast.error('Task title is required');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                projectId,
                title,
                description,
                priority,
                status,
                dueDate: dueDate || null,
            };

            // Explicitly set assignedTo (can be null if unassigned)
            if (assignedTo) {
                payload.assignedTo = assignedTo;
            } else {
                payload.assignedTo = null;
            }

            const response = await api.put(`/task/${task._id}?projectId=${projectId}`, payload);
            if (response.data.success) {
                toast.success(response.data.message || 'Task updated successfully!');
                onTaskUpdated(response.data.data);
                onClose();
            }
        } catch (error) {
            console.error('Failed to update task', error);
            toast.error(error.response?.data?.message || 'Failed to update task');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[16px] shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h2 className="text-[18px] font-bold text-slate-900">Update Task</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors outline-none"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        {/* Title */}
                        <div>
                            <label htmlFor="title" className="block text-[13px] font-bold text-slate-700 mb-1.5">
                                Task Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Design Homepage"
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-[8px] text-[14px] text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400"
                                autoFocus
                            />
                        </div>
                        
                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-[13px] font-bold text-slate-700 mb-1.5">
                                Description
                            </label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Detailed description of the task..."
                                rows={3}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-[8px] text-[14px] text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400 resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Due Date */}
                            <div>
                                <label htmlFor="dueDate" className="block text-[13px] font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                                    Due Date
                                </label>
                                <input
                                    id="dueDate"
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-[8px] text-[14px] text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                />
                            </div>

                            {/* Priority */}
                            <div>
                                <label htmlFor="priority" className="block text-[13px] font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                                    <Flag className="w-4 h-4 text-slate-400" />
                                    Priority
                                </label>
                                <select
                                    id="priority"
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-[8px] text-[14px] text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Status */}
                            <div>
                                <label htmlFor="status" className="block text-[13px] font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                                    <Activity className="w-4 h-4 text-slate-400" />
                                    Status
                                </label>
                                <select
                                    id="status"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-[8px] text-[14px] text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="todo">Todo</option>
                                    <option value="inprogress">In Progress</option>
                                    <option value="done">Done</option>
                                </select>
                            </div>

                            {/* Assignee */}
                            <div>
                                <label htmlFor="assignedTo" className="block text-[13px] font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                                    <User className="w-4 h-4 text-slate-400" />
                                    Assignee
                                </label>
                                <select
                                    id="assignedTo"
                                    value={assignedTo}
                                    onChange={(e) => setAssignedTo(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-[8px] text-[14px] text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Unassigned</option>
                                    {projectMembers.map((member) => (
                                        <option key={member.userId._id || member.userId} value={member.userId._id || member.userId}>
                                            {member.userId.name || 'Member'} ({member.userId.email || 'Email hidden'})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-slate-50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-[13px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-[8px] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2.5 text-[13px] font-bold text-white bg-[#0F172A] hover:opacity-90 rounded-[8px] transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Update Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
