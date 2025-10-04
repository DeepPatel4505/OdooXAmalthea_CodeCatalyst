import { motion } from "framer-motion";

// Page transition wrapper component
export const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className="w-full"
  >
    {children}
  </motion.div>
);

// Button with hover animation
export const AnimatedButton = ({ 
  children, 
  className = "", 
  onClick, 
  type = "button",
  disabled = false,
  variant = "primary" // primary, secondary, success, error
}) => {
  // Define variant styles
  const variantStyles = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white",
    secondary: "bg-cyan-600 hover:bg-cyan-700 text-white",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white",
    error: "bg-red-600 hover:bg-red-700 text-white",
    outline: "bg-transparent border border-indigo-600 text-indigo-600 hover:bg-indigo-50"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05, boxShadow: "0px 4px 14px rgba(0,0,0,0.15)" }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`px-4 py-2 rounded-lg font-medium ${variantStyles[variant]} ${className}`}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
};

// Modal animation wrapper
export const AnimatedModal = ({ children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.3 }}
    className={`bg-white p-6 rounded-2xl shadow-lg ${className}`}
  >
    {children}
  </motion.div>
);

// Card animation wrapper
export const AnimatedCard = ({ children, className = "" }) => (
  <motion.div
    whileHover={{ y: -5, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
    transition={{ duration: 0.2 }}
    className={`bg-white p-6 rounded-xl shadow-md ${className}`}
  >
    {children}
  </motion.div>
);

// List item animation for tables and lists
export const AnimatedListItem = ({ children, index = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
    className={className}
  >
    {children}
  </motion.div>
);

// Loading spinner animation
export const LoadingSpinner = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={`border-4 border-indigo-100 border-t-indigo-600 rounded-full ${sizeClasses[size]} ${className}`}
    />
  );
};

// Success animation (checkmark)
export const SuccessAnimation = ({ className = "" }) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ type: "spring", stiffness: 200, damping: 10 }}
    className={`flex items-center justify-center rounded-full bg-emerald-100 p-2 ${className}`}
  >
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className="h-6 w-6 text-emerald-600" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  </motion.div>
);

// Error animation (X)
export const ErrorAnimation = ({ className = "" }) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ type: "spring", stiffness: 200, damping: 10 }}
    className={`flex items-center justify-center rounded-full bg-red-100 p-2 ${className}`}
  >
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className="h-6 w-6 text-red-600" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  </motion.div>
);