import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import LottieLib from 'react-lottie';
const Lottie = LottieLib.default || LottieLib;
import { setError, clearError, loginSuccess, setUser } from '../../store/slices/authSlices';
import api from '../../../services/api';
import { toast } from 'react-toastify';
import loginAnimation from '../../assets/Login.json';

export default function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { error } = useSelector((state) => state.auth);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) dispatch(clearError());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await api.post('/auth/signin', formData);
            if (response.data.success) {
                dispatch(loginSuccess(response.data.data.user));
                const meResponse = await api.get('/auth/me');
                if (meResponse.data.success) dispatch(setUser(meResponse.data.data));
                toast.success('Welcome back!');
                navigate('/dashboard');
            }
        } catch (err) {
            const responseData = err.response?.data;
            const errorMessage = responseData?.message || 'Login failed. Please check your credentials.';
            dispatch(setError(errorMessage));
            toast.error(errorMessage);
            if (responseData?.errors && Array.isArray(responseData.errors)) {
                responseData.errors.forEach(e => {
                    if (e.message && e.message !== errorMessage) {
                        toast.error(e.message);
                    }
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const lottieOptions = {
        loop: true,
        autoplay: true,
        animationData: loginAnimation,
        rendererSettings: { preserveAspectRatio: 'xMidYMid slice' },
    };

    return (
        <div className="auth-page">
            {isSubmitting && (
                <div
                    style={{
                        position: 'fixed', inset: 0, zIndex: 9999,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: 'rgba(15,23,42,0.35)',
                        backdropFilter: 'blur(6px)',
                        WebkitBackdropFilter: 'blur(6px)',
                        pointerEvents: 'all',
                    }}
                >
                    <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
                        background: 'rgba(255,255,255,0.92)', borderRadius: '20px',
                        padding: '36px 48px', boxShadow: '0 12px 40px rgba(0,0,0,0.22)',
                    }}>
                        <svg style={{ width: 48, height: 48, animation: 'spin 0.8s linear infinite' }}
                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle style={{ opacity: 0.2 }} cx="12" cy="12" r="10"
                                stroke="#0F172A" strokeWidth="3" />
                            <path style={{ opacity: 1 }} fill="#0F172A"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span style={{ fontWeight: 700, fontSize: 15, color: '#0F172A', letterSpacing: '0.02em' }}>
                            Signing in…
                        </span>
                    </div>
                </div>
            )}
            {/* ── Left Panel: Lottie animation ── */}
            <div className="auth-left">
                <div className="auth-left-content">
                    <h1 className="auth-brand">Team Task Manager</h1>
                    <p className="auth-tagline">Manage your team's work, effortlessly.</p>
                    <div className="auth-lottie-wrapper">
                        <Lottie options={lottieOptions} height={320} width={320} />
                    </div>
                </div>
            </div>

            {/* ── Right Panel: Form ── */}
            <div className="auth-right">
                <div className="auth-card">
                    <h2 className="auth-title">Sign In</h2>
                    <p className="auth-subtitle">Sign in to continue to your workspace</p>
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <div className="form-label-row">
                                <label className="form-label">Password</label>
                            </div>
                            <div className="input-icon-wrap">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="form-input pr-icon"
                                    placeholder="••••••••"
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="eye-btn">
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="eye-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="eye-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={isSubmitting} className="auth-btn">
                            {isSubmitting ? (
                                <svg className="spin-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    <p className="auth-footer-text">
                        Don't have an account?{' '}
                        <Link to="/signup" className="auth-footer-link">Sign up now</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
