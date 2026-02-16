import React, { useState, useCallback, useEffect, useMemo, createContext, useContext } from "react";

const ToastContext = createContext();

export function useToast() {
    return useContext(ToastContext);
}

let toastIdCounter = 0;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = "success", duration = 3500) => {
        const id = ++toastIdCounter;
        setToasts((prev) => [...prev, { id, message, type, exiting: false }]);

        setTimeout(() => {
            setToasts((prev) =>
                prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
            );
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, 400);
        }, duration);
    }, []);

    const toast = useMemo(() => ({
        success: (msg) => addToast(msg, "success"),
        error: (msg) => addToast(msg, "error"),
        info: (msg) => addToast(msg, "info"),
        warning: (msg) => addToast(msg, "warning"),
    }),
        [addToast]
    );

    // Expose globally for non-component usage
    useEffect(() => {
        window.__toast = toast;
    }, [toast]);

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="toast-container" aria-live="polite">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`toast toast-${t.type} ${t.exiting ? "toast-exit" : ""}`}
                    >
                        <span className="toast-icon">
                            {t.type === "success" && "✅"}
                            {t.type === "error" && "❌"}
                            {t.type === "info" && "ℹ️"}
                            {t.type === "warning" && "⚠️"}
                        </span>
                        <span className="toast-message">{t.message}</span>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export default ToastProvider;
