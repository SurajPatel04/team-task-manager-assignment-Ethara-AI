import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import LottieImport from 'lottie-react';
import networkAnimation from '../assets/Network.json';

const Lottie = LottieImport.default || LottieImport;

const MAX_RETRIES = 3;
const COUNTDOWN_SECONDS = 60;

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
const SERVER_BASE = apiUrl.replace(/\/api\/v1\/?$/, '');

function HealthCheck({ children }) {
  const [status, setStatus] = useState('initializing');
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [attempt, setAttempt] = useState(1);
  const timerRef = useRef(null);
  const abortRef = useRef(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const pingHealth = useCallback(async (currentAttempt) => {
    setCountdown(COUNTDOWN_SECONDS);
    setStatus('checking');

    clearTimer();
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const startTime = Date.now();
    const maxDuration = COUNTDOWN_SECONDS * 1000;

    while (Date.now() - startTime < maxDuration) {
      try {
        abortRef.current = new AbortController();
        const response = await axios.get(`${SERVER_BASE}/health`, {
          timeout: 8000,
          signal: abortRef.current.signal,
        });

        if (response.status === 200) {
          clearTimer();
          setStatus('ready');
          return;
        }
      } catch {
      }

      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    clearTimer();

    if (currentAttempt < MAX_RETRIES) {
      setAttempt(currentAttempt + 1);
      pingHealth(currentAttempt + 1);
    } else {
      setStatus('failed');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const silentCheck = async () => {
      try {
        abortRef.current = new AbortController();
        const response = await axios.get(`${SERVER_BASE}/health`, {
          timeout: 1000,
          signal: abortRef.current.signal,
        });

        if (!cancelled && response.status === 200) {
          setStatus('ready');
          return;
        }
      } catch {
        console.log('Server not ready yet — wait and retry');
      }

      if (!cancelled) {
        setTimeout(() => {
          if (!cancelled) {
            pingHealth(1);
          }
        }, 1000);
      }
    };

    silentCheck();

    return () => {
      cancelled = true;
      clearTimer();
      if (abortRef.current) abortRef.current.abort();
    };
  }, [pingHealth]);

  const handleRetry = () => {
    setAttempt(1);
    setStatus('checking');
    pingHealth(1);
  };

  if (status === 'ready') {
    return children;
  }

  if (status === 'initializing') {
    return null;
  }

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const progress = ((COUNTDOWN_SECONDS - countdown) / COUNTDOWN_SECONDS) * 100;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white overflow-hidden">
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 max-w-5xl w-[90%] animate-in fade-in zoom-in-95 duration-700">

        {status === 'checking' && (
          <>
            {/* Left Side: Lottie Animation */}
            <div className="flex-shrink-0 relative w-96 h-96 md:w-[550px] md:h-[550px] flex items-center justify-center">
              <div className="absolute inset-20 md:inset-28 rounded-full border-2 border-indigo-100 animate-ping"></div>
              <Lottie animationData={networkAnimation} loop={true} className="w-full h-full z-10" />
            </div>

            {/* Right Side: Messages and Timer */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-lg">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Server is waking up...</h2>
              <p className="text-base text-slate-500 leading-relaxed mb-10">
                The server is currently cold-starting. This process usually takes about 50–60 seconds.<br className="hidden md:block" />
                Please hang tight while we get everything ready for you!
              </p>

              <div className="w-full flex flex-col items-center md:items-start bg-slate-50 border border-slate-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-6 w-full">

                  {/* Countdown timer */}
                  <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center bg-white rounded-full shadow-sm">
                    <svg viewBox="0 0 120 120" className="absolute inset-0 w-full h-full -rotate-90">
                      <circle cx="60" cy="60" r="52" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                      <circle
                        cx="60" cy="60" r="52"
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="8"
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-linear"
                        style={{
                          strokeDasharray: `${2 * Math.PI * 52}`,
                          strokeDashoffset: `${2 * Math.PI * 52 * (1 - progress / 100)}`,
                        }}
                      />
                    </svg>
                    <span className="text-xl font-bold text-slate-800 tabular-nums tracking-wider z-10">{timeStr}</span>
                  </div>

                  {/* Progress & Attempt */}
                  <div className="flex-1 w-full text-left">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-semibold text-slate-700">Waking up</span>
                      <span className="text-xs font-medium text-slate-400">Attempt {attempt} of {MAX_RETRIES}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-1000 ease-linear"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </>
        )}

        {status === 'failed' && (
          <>
            {/* Left Side: Failed Icon */}
            <div className="flex-shrink-0 relative w-64 h-64 md:w-[350px] md:h-[350px] flex items-center justify-center text-red-500 bg-red-50 rounded-full">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>

            {/* Right Side: Failed Message */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-lg">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Server Unavailable</h2>
              <p className="text-base text-slate-500 leading-relaxed mb-8">
                We couldn't reach the server after {MAX_RETRIES} attempts.<br />
                Please try again later or contact support.
              </p>

              <button
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-bold rounded-xl shadow-[0_4px_14px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                onClick={handleRetry}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                Try Again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default HealthCheck;
