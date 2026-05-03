import { useState } from 'react';
import { X, Mail, Loader2, UserPlus } from 'lucide-react';
import api from '../../../services/api';
import { toast } from 'react-toastify';

export default function InviteMemberModal({ isOpen, onClose, projectId, onMemberAdded }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;

        setLoading(true);
        try {
            const response = await api.post(`/project/${projectId}/members`, { email });
            if (response.data.success) {
                toast.success('Member invited successfully!');
                setEmail('');
                onMemberAdded();
                onClose();
            }
        } catch (error) {
            console.error('Failed to invite member', error);
            toast.error(error.response?.data?.message || 'Failed to invite member');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
            
            <div className="relative w-full max-w-md bg-white rounded-[20px] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <UserPlus className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-[17px] font-bold text-slate-900">Invite Team Member</h2>
                            <p className="text-[12px] text-slate-500 font-medium">Add someone to your project</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-6">
                        <label className="block text-[13px] font-bold text-slate-700 mb-2 px-1">Email Address</label>
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                <Mail className="w-4.5 h-4.5" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="colleague@example.com"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-[12px] text-[14px] outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                required
                                autoFocus
                            />
                        </div>
                        <p className="mt-2 text-[11px] text-slate-400 px-1 italic">
                            Only registered users can be added to projects.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-[12px] text-[14px] font-bold text-slate-600 hover:bg-slate-100 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !email.trim()}
                            className="flex-[2] bg-[#0F172A] text-white px-4 py-3 rounded-[12px] text-[14px] font-bold shadow-lg shadow-blue-900/20 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4" />
                                    Send Invitation
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
