import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    FolderKanban,
    LogOut,
    X,
} from 'lucide-react';
import etharaLogo from '../../assets/Ethara.png';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlices';
import api from '../../../services/api';
import { toast } from 'react-toastify';

export default function Sidebar({ isOpen, onClose }) {
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Projects', path: '/projects', icon: FolderKanban },
    ];

    const dispatch = useDispatch();

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
            dispatch(logout());
            toast.success('Logged out successfully');
        } catch (err) {
            console.error('Logout failed', err);
            dispatch(logout()); // Logout locally anyway
        }
    };

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[45] md:hidden transition-all duration-300"
                    onClick={onClose}
                />
            )}

            <aside className={`w-[260px] bg-white border-r border-slate-200 h-screen flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                {/* Logo Area */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
                    <Link to="/" className="flex items-center gap-3">
                        <img src={etharaLogo} alt="Ethara" className="w-8 h-8 object-contain" />
                        <div className="flex flex-col">
                            <span className="font-bold text-[#0F172A] text-[15px] tracking-tight leading-tight">Team Task Manager</span>
                            <span className="text-[10px] text-slate-500 font-medium">Ethara.ai</span>
                        </div>
                    </Link>

                    {/* Close button for mobile */}
                    <button onClick={onClose} className="md:hidden p-2 text-slate-500 hover:text-slate-900">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1.5">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-sm font-semibold transition-all duration-200 ${isActive(item.path)
                                    ? 'bg-[#EEF2FF] text-[#2563EB]'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-[#2563EB]' : 'text-slate-400'}`} strokeWidth={isActive(item.path) ? 2.5 : 2} />
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Bottom Action */}
                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={handleLogout}
                        className="w-full bg-[#0F172A] text-white flex items-center justify-center gap-2 py-3 rounded-[12px] text-sm font-bold shadow-md shadow-blue-900/20 hover:opacity-90 transition-all active:scale-[0.98]"
                    >
                        <LogOut className="w-4 h-4" strokeWidth={2.5} />
                        Sign Out
                    </button>
                </div>
            </aside>
        </>
    );
}
