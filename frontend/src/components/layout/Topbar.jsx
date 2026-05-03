import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/slices/authSlices';
import api from '../../../services/api';
import DeleteConfirmModal from '../modals/DeleteConfirmModal';

export default function Topbar({ onMenuClick }) {
    const { user } = useSelector((state) => state.auth);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const dropdownRef = useRef(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error('Logout error', err);
        } finally {
            setIsLoggingOut(false);
            setIsLogoutModalOpen(false);
            dispatch(logout());
            setIsMenuOpen(false);
            navigate('/login');
        }
    };

    return (
        <>
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
            {/* Left: Mobile Menu Toggle */}
            <button 
                onClick={onMenuClick}
                className="md:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Right: Profile */}
            <div className="flex items-center gap-4 ml-auto">
                {/* Profile Dropdown */}
                <div className="relative ml-2" ref={dropdownRef}>
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white border border-slate-200 hover:ring-blue-100 transition-all overflow-hidden"
                    >
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
                            <div className="px-4 py-3 border-b border-slate-50">
                                <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                                <p className="text-xs font-medium text-slate-500 truncate mt-0.5">{user?.email}</p>
                            </div>
                            <div className="px-2 py-1.5">
                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        setIsLogoutModalOpen(true);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            </header>

            <DeleteConfirmModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleLogout}
                title="Sign Out"
                customMessage={<>Are you sure you want to sign out of your account?</>}
                confirmLabel="Sign Out"
                confirmIcon={LogOut}
                confirmButtonColor="bg-[#0F172A] text-white hover:opacity-90"
                isLoading={isLoggingOut}
            />
        </>
    );
}
