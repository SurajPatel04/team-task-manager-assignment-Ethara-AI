import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../store/slices/authSlices';
import api from '../../../services/api';

export default function Navbar() {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const dropdownRef = useRef(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Close dropdown when clicking outside
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
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error('Logout error', err);
        } finally {
            dispatch(logout());
            setIsMenuOpen(false);
            setShowLogoutModal(false);
            navigate('/login');
        }
    };

    return (
        <>
            <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link to="/" className="flex-shrink-0 flex items-center">
                                <div className="w-10 h-10 flex items-center justify-center mr-2.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-[#0F172A]">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M12 4C12 4 8 8 8 12C8 16 12 20 12 20" />
                                        <path d="M12 4C12 4 16 8 16 12C16 16 12 20 12 20" />
                                        <path d="M4 12C4 12 8 8 12 8C16 8 20 12 20 12" />
                                        <path d="M4 12C4 12 8 16 12 16C16 16 20 12 20 12" />
                                        <circle cx="12" cy="12" r="2" fill="currentColor" />
                                    </svg>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-[22px] text-[#0F172A] tracking-tight leading-none mb-1">Team Task Manager</span>
                                    <span className="text-[14px] text-[#2563EB] font-medium leading-none">Ethara.ai</span>
                                </div>
                            </Link>
                        </div>

                        <div className="flex items-center">
                            {isAuthenticated && user ? (
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                        className="flex items-center space-x-3 p-1.5 rounded-full hover:bg-gray-50 transition-all duration-200 focus:outline-none"
                                    >
                                        <div className="h-9 w-9 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold shadow-sm border-2 border-white ring-1 ring-gray-100">
                                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <svg 
                                            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {isMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="px-4 py-3 border-b border-gray-50">
                                                <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                                                <p className="text-xs font-medium text-gray-500 truncate mt-0.5">{user.email}</p>
                                            </div>
                                            <div className="px-2 py-1.5">
                                                <Link 
                                                    to="/dashboard" 
                                                    className="flex items-center px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 hover:text-[#0F172A] transition-colors"
                                                    onClick={() => setIsMenuOpen(false)}
                                                >
                                                    Dashboard
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        setShowLogoutModal(true);
                                                        setIsMenuOpen(false);
                                                    }}
                                                    className="w-full flex items-center px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors mt-1"
                                                >
                                                    Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex space-x-3">
                                    <Link
                                        to="/login"
                                        className="text-[#0F172A] hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        to="/signup"
                                        className="bg-[#0F172A] text-white hover:opacity-90 px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-sm"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px] transition-opacity"
                        onClick={() => setShowLogoutModal(false)}
                    ></div>
                    
                    {/* Modal Content */}
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 transform transition-all animate-in zoom-in-95 duration-200">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-50 mb-4">
                                <svg className="h-7 w-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Sign Out?</h3>
                            <p className="text-gray-500 mb-8">Are you sure you want to log out of your account?</p>
                            
                            <div className="flex flex-col space-y-3">
                                <button
                                    onClick={handleLogout}
                                    className="w-full py-3 px-4 bg-[#0F172A] text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg"
                                >
                                    Confirm Logout
                                </button>
                                <button
                                    onClick={() => setShowLogoutModal(false)}
                                    className="w-full py-3 px-4 bg-gray-50 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
