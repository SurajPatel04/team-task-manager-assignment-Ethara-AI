import { useState, useEffect } from 'react';
import { X, Loader2, Calendar as CalendarIcon, User, Flag } from 'lucide-react';
import api from '../../../services/api';
import { toast } from 'react-toastify';

export default function CreateTaskModal({ isOpen, onClose, projectId, projectMembers = [], onTaskCreated }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState('medium');
    const [assignedTo, setAssignedTo] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

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
                dueDate: dueDate || null,
            };

            if (assignedTo) {
                payload.assignedTo = assignedTo;
            }

            const response = await api.post('/task', payload);
            if (response.data.success) {
                toast.success('Task created successfully!');
                onTaskCreated(response.data.data);
                handleClose();
            }
        } catch (error) {
            console.error('Failed to create task', error);
            toast.error(error.response?.data?.message || 'Failed to create task');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setTitle('');
        setDescription('');
        setDueDate('');
        setPriority('medium');
        setAssignedTo('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[16px] shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h2 className="text-[18px] font-bold text-slate-900">Create New Task</h2>
                    <button 
                        onClick={handleClose}
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

                    <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-slate-50">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-5 py-2.5 text-[13px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-[8px] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2.5 text-[13px] font-bold text-white bg-[#0F172A] hover:opacity-90 rounded-[8px] transition-opacity flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Create Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
