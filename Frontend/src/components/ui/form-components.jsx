import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AnimatedButton, LoadingSpinner, SuccessAnimation, ErrorAnimation } from "./animations";

// Enhanced form wrapper with animations
export const FormWrapper = ({ children, onSubmit, className = "" }) => {
  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`space-y-6 ${className}`}
      onSubmit={onSubmit}
    >
      {children}
    </motion.form>
  );
};

// Form section with title
export const FormSection = ({ title, description, children, className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`space-y-4 ${className}`}
    >
      {title && (
        <div className="space-y-1">
          <h3 className="text-lg font-medium">{title}</h3>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </motion.div>
  );
};

// Form field with label and input
export const FormField = ({ 
  label, 
  name, 
  type = "text", 
  placeholder = "", 
  value, 
  onChange, 
  error,
  required = false,
  className = ""
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={name} className="text-sm font-medium">
        {label} {required && <span className="text-error">*</span>}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full ${error ? 'border-error focus:ring-error' : ''}`}
      />
      {error && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="text-sm text-error mt-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

// Form submit button with loading state
export const FormSubmitButton = ({ 
  children, 
  isLoading = false, 
  disabled = false,
  className = "",
  variant = "primary"
}) => {
  return (
    <AnimatedButton
      type="submit"
      disabled={disabled || isLoading}
      className={`w-full flex items-center justify-center ${className}`}
      variant={variant}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          Processing...
        </>
      ) : (
        children
      )}
    </AnimatedButton>
  );
};

// Form feedback message (success/error)
export const FormFeedback = ({ 
  type = "success", // success, error
  message,
  visible = false,
  className = ""
}) => {
  if (!visible || !message) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={`flex items-center p-4 rounded-lg ${
        type === "success" ? "bg-success-50 text-success-800" : "bg-error-50 text-error-800"
      } ${className}`}
    >
      {type === "success" ? (
        <SuccessAnimation className="mr-3 h-5 w-5" />
      ) : (
        <ErrorAnimation className="mr-3 h-5 w-5" />
      )}
      <p className="text-sm font-medium">{message}</p>
    </motion.div>
  );
};

// Form divider with optional text
export const FormDivider = ({ text, className = "" }) => {
  return (
    <div className={`relative flex items-center py-4 ${className}`}>
      <div className="flex-grow border-t border-border"></div>
      {text && (
        <span className="flex-shrink mx-4 text-sm text-muted-foreground">{text}</span>
      )}
      <div className="flex-grow border-t border-border"></div>
    </div>
  );
};

// Form card wrapper
export const FormCard = ({ children, className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-card border border-border rounded-xl shadow-sm p-6 md:p-8 ${className}`}
    >
      {children}
    </motion.div>
  );
};