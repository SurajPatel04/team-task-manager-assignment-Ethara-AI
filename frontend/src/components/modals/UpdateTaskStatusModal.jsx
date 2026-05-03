import { useState, useEffect } from 'react';
import { X, Loader2, Activity } from 'lucide-react';
import api from '../../../services/api';
import { toast } from 'react-toastify';

export default function UpdateTaskStatusModal({ isOpen, onClose, task, projectId, onTaskUpdated }) {
    const [status, setStatus] = useState('todo');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && task) {
            setStatus(task.status || 'todo');
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, task]);

    if (!isOpen || !task) return null;

    const statusOptions = [
        { value: 'todo', label: 'Todo', color: 'bg-slate-100 text-slate-700 border-slate-200' },
        { value: 'inprogress', label: 'In Progress', color: 'bg-blue-50 text-blue-700 border-blue-200' },
        { value: 'done', label: 'Done', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        try {
            const response = await api.patch(`/task/${task._id}/status?projectId=${projectId}`, { status });
            if (response.data.success) {
                toast.success(response.data.message || 'Task status updated!');
                onTaskUpdated(response.data.data);
                onClose();
            }
        } catch (error) {
            console.error('Failed to update task status', error);
            toast.error(error.response?.data?.message || 'Failed to update task status');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[16px] shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div>
                        <h2 className="text-[18px] font-bold text-slate-900">Update Status</h2>
                        <p className="text-[12px] text-slate-500 mt-0.5 line-clamp-1">{task.title}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors outline-none"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <label className="block text-[13px] font-bold text-slate-700 mb-3 flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-slate-400" />
                        Select New Status
                    </label>

                    <div className="space-y-2">
                        {statusOptions.map((opt) => (
                            <label
                                key={opt.value}
                                className={`flex items-center gap-3 px-4 py-3 rounded-[10px] border cursor-pointer transition-all ${
                                    status === opt.value
                                        ? opt.color + ' border-current ring-2 ring-offset-1 ring-current/20'
                                        : 'border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="status"
                                    value={opt.value}
                                    checked={status === opt.value}
                                    onChange={() => setStatus(opt.value)}
                                    className="hidden"
                                />
                                <span className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${
                                    status === opt.value ? 'border-current bg-current' : 'border-slate-300'
                                }`} />
                                <span className="text-[14px] font-semibold">{opt.label}</span>
                            </label>
                        ))}
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-[13px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-[8px] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || status === task.status}
                            className="px-5 py-2.5 text-[13px] font-bold text-white bg-[#0F172A] hover:opacity-90 rounded-[8px] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Update Status
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
