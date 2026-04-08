import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// Singleton toast manager
let toastHandler = null;

export const toast = {
  error: (message) => toastHandler?.({ message, type: "error" }),
  success: (message) => toastHandler?.({ message, type: "success" }),
  info: (message) => toastHandler?.({ message, type: "info" }),
  warning: (message) => toastHandler?.({ message, type: "warning" }),
};

const ICONS = {
  error: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  success: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
};

const STYLES = {
  error: "bg-red-50 border-red-200 text-red-800 [&>div:first-child]:text-red-500",
  success: "bg-green-50 border-green-200 text-green-800 [&>div:first-child]:text-green-500",
  info: "bg-blue-50 border-blue-200 text-blue-800 [&>div:first-child]:text-blue-500",
  warning: "bg-amber-50 border-amber-200 text-amber-800 [&>div:first-child]:text-amber-500",
};

const ToastItem = ({ message, type, onRemove }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onRemove, 300);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg max-w-sm w-full transition-all duration-300 ${STYLES[type]} ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      }`}
    >
      <div className="shrink-0 mt-0.5">{ICONS[type]}</div>
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
        onClick={() => { setVisible(false); setTimeout(onRemove, 300); }}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export const ToastProvider = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    toastHandler = ({ message, type }) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);
    };
    return () => { toastHandler = null; };
  }, []);

  const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return createPortal(
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem message={t.message} type={t.type} onRemove={() => remove(t.id)} />
        </div>
      ))}
    </div>,
    document.body
  );
};
