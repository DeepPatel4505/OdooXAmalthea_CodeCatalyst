import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, AlertCircle, X, Loader2 } from "lucide-react";

export const Toast = ({ 
  message, 
  type = "success", 
  duration = 3000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose?.();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icon = type === "success" ? (
    <Check className="h-5 w-5 text-white" />
  ) : type === "error" ? (
    <AlertCircle className="h-5 w-5 text-white" />
  ) : (
    <Loader2 className="h-5 w-5 text-white animate-spin" />
  );

  const bgColor = type === "success" 
    ? "bg-success" 
    : type === "error" 
    ? "bg-error" 
    : "bg-primary";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-4 right-4 z-50 flex items-center space-x-2 rounded-lg shadow-lg px-4 py-3"
          style={{ backgroundColor: `var(--${type})` }}
        >
          <div className="flex-shrink-0">{icon}</div>
          <p className="text-white font-medium">{message}</p>
          <button
            onClick={() => setIsVisible(false)}
            className="ml-2 text-white/80 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const LoadingSpinner = ({ size = "md", className = "" }) => {
  const sizeClass = 
    size === "sm" ? "h-4 w-4" : 
    size === "lg" ? "h-8 w-8" : 
    "h-6 w-6";

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={`${sizeClass} border-2 border-primary border-t-transparent rounded-full ${className}`}
    />
  );
};

export const LoadingOverlay = ({ message = "Loading..." }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
  >
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.9 }}
      className="bg-white rounded-xl p-6 shadow-xl flex flex-col items-center"
    >
      <LoadingSpinner size="lg" className="mb-4" />
      <p className="text-gray-700 font-medium">{message}</p>
    </motion.div>
  </motion.div>
);

export const SuccessAnimation = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          transition: { delay: 0.2, duration: 0.3 }
        }}
        className="rounded-full bg-success flex items-center justify-center h-16 w-16"
      >
        <motion.div
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Check className="h-8 w-8 text-white" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export const ErrorAnimation = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          transition: { delay: 0.2, duration: 0.3 }
        }}
        className="rounded-full bg-error flex items-center justify-center h-16 w-16"
      >
        <motion.div
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <X className="h-8 w-8 text-white" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "success", duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </>
  );
};

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "success", duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    
    setTimeout(() => {
      removeToast(id);
    }, duration);
    
    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const success = (message, duration) => addToast(message, "success", duration);
  const error = (message, duration) => addToast(message, "error", duration);
  const loading = (message, duration) => addToast(message, "loading", duration);

  const ToastContainer = () => (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );

  return {
    toast: addToast,
    success,
    error,
    loading,
    ToastContainer,
  };
};