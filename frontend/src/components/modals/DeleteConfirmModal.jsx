import { useEffect } from 'react';
import { Trash2, X, AlertTriangle, Loader2 } from 'lucide-react';

export default function DeleteConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Delete Item",
    itemName,
    confirmLabel = "Delete",
    isLoading = false,
    customMessage,
    confirmIcon: ConfirmIcon = Trash2,
    confirmButtonColor = "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
}) {
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[16px] shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                        <h2 className="text-[17px] font-bold text-slate-900">{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 hover:backdrop-blur-sm rounded-full transition-all outline-none"
                        disabled={isLoading}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5">
                    <p className="text-[14px] text-slate-600 leading-relaxed">
                        {customMessage ? (
                            customMessage
                        ) : (
                            <>
                                Are you sure you want to delete{' '}
                                <span className="font-bold text-slate-900">"{itemName}"</span>?
                                This action <span className="text-red-600 font-semibold">cannot be undone</span>.
                            </>
                        )}
                    </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-5 py-2.5 text-[13px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 hover:backdrop-blur-sm rounded-[8px] transition-all disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-5 py-2.5 text-[13px] font-bold ${confirmButtonColor} rounded-[8px] transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed`}
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <ConfirmIcon className="w-4 h-4" />
                        )}
                        {isLoading ? 'Processing...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
