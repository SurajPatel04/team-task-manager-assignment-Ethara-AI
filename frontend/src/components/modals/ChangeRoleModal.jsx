import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { X, Shield, UserCheck, Loader2, ChevronDown } from 'lucide-react';

export default function ChangeRoleModal({
    isOpen,
    onClose,
    member,
    projectId,
    onRoleChanged,
    api,
}) {
    const [selectedRole, setSelectedRole] = useState('member');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (member) {
            setSelectedRole(member.role === 'admin' ? 'member' : 'admin');
        }
    }, [member]);

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen || !member) return null;

    const memberUserId = member.userId?._id || member.userId;
    const memberName = member.userId?.name || 'this member';
    const currentRole = member.role;

    const handleConfirm = async () => {
        if (selectedRole === currentRole) {
            onClose();
            return;
        }
        setIsLoading(true);
        try {
            const response = await api.patch(
                `/project/${projectId}/members/${memberUserId}/role`,
                { role: selectedRole }
            );
            if (response.data.success) {
                onRoleChanged(memberUserId, selectedRole);
                onClose();
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to change role';
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[16px] shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                        <Shield className="w-4 h-4 text-indigo-500" />
                        <h2 className="text-[17px] font-bold text-slate-900">Change Role</h2>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 rounded-full transition-all outline-none"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 flex flex-col gap-4">
                    {/* Member info chip */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-[10px] border border-slate-100">
                        <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-[13px] font-bold text-slate-600 shrink-0">
                            {memberName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[14px] font-bold text-slate-900 truncate">{memberName}</p>
                            <p className="text-[12px] text-slate-500 truncate">{member.userId?.email}</p>
                        </div>
                        {/* Current role badge */}
                        <span className={`ml-auto shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${currentRole === 'admin'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-slate-200 text-slate-600'
                            }`}>
                            {currentRole}
                        </span>
                    </div>

                    {/* Role selector */}
                    <div>
                        <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                            New Role
                        </label>
                        <div className="relative">
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                disabled={isLoading}
                                className="w-full appearance-none pl-4 pr-10 py-2.5 border border-slate-200 rounded-[10px] text-[14px] font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-60 cursor-pointer"
                            >
                                <option value="member">Member</option>
                                <option value="admin">Admin</option>
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        </div>

                        {/* Contextual hint */}
                        {selectedRole === 'admin' && (
                            <p className="mt-2 text-[12px] text-amber-600 font-medium">
                                ⚠️ Admins can manage tasks, members, and project settings.
                            </p>
                        )}
                        {selectedRole === 'member' && currentRole === 'admin' && (
                            <p className="mt-2 text-[12px] text-slate-500">
                                This member will lose admin privileges.
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-5 py-2.5 text-[13px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-[8px] transition-all disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading || selectedRole === currentRole}
                        className="px-5 py-2.5 text-[13px] font-bold bg-[#0F172A] text-white hover:opacity-90 rounded-[8px] transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <UserCheck className="w-4 h-4" />
                        )}
                        {isLoading ? 'Updating…' : 'Confirm Change'}
                    </button>
                </div>
            </div>
        </div>
    );
}
