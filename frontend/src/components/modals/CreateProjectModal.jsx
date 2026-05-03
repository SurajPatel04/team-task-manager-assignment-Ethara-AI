import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import api from '../../../services/api';
import { toast } from 'react-toastify';

export default function CreateProjectModal({ isOpen, onClose, onProjectCreated }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
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
        
        if (!name.trim()) {
            toast.error('Project name is required');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/project', { name, description });
            if (response.data.success) {
                toast.success('Project created successfully!');
                onProjectCreated(response.data.data);
                onClose();
                setName('');
                setDescription('');
            }
        } catch (error) {
            console.error('Failed to create project', error);
            toast.error(error.response?.data?.message || 'Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[16px] shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h2 className="text-[18px] font-bold text-slate-900">Create New Project</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors outline-none"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-[13px] font-bold text-slate-700 mb-1.5">
                                Project Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Q3 Marketing Campaign"
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-[8px] text-[14px] text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400"
                                autoFocus
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="description" className="block text-[13px] font-bold text-slate-700 mb-1.5">
                                Description
                            </label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Brief description of the project..."
                                rows={3}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-[8px] text-[14px] text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400 resize-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-8">
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
                            className="px-5 py-2.5 text-[13px] font-bold text-white bg-[#0F172A] hover:opacity-90 rounded-[8px] transition-opacity flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Create Project
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
