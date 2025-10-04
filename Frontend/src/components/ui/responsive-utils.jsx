import { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Responsive container that adapts to screen size
export const ResponsiveContainer = ({ children, className = "", maxWidth = "max-w-7xl" }) => {
  return (
    <div className={`w-full mx-auto px-4 sm:px-6 lg:px-8 ${maxWidth} ${className}`}>
      {children}
    </div>
  );
};

// Grid that changes columns based on screen size
export const ResponsiveGrid = ({ 
  children, 
  className = "", 
  cols = { sm: 1, md: 2, lg: 3, xl: 4 } 
}) => {
  const gridClass = `grid gap-4 sm:gap-6 
    grid-cols-${cols.sm} 
    sm:grid-cols-${cols.sm} 
    md:grid-cols-${cols.md} 
    lg:grid-cols-${cols.lg} 
    xl:grid-cols-${cols.xl}`;

  return (
    <div className={`${gridClass} ${className}`}>
      {children}
    </div>
  );
};

// Stack that changes direction based on screen size
export const ResponsiveStack = ({ 
  children, 
  className = "", 
  direction = "vertical", // "vertical" or "horizontal"
  reverse = false,
  spacing = "space-y-4 sm:space-y-0 sm:space-x-4"
}) => {
  const flexDirection = direction === "vertical" 
    ? "flex-col sm:flex-row" 
    : "flex-row";
  
  const reverseClass = reverse ? "sm:flex-row-reverse" : "";

  return (
    <div className={`flex ${flexDirection} ${reverseClass} ${spacing} ${className}`}>
      {children}
    </div>
  );
};

// Hook to detect current screen size
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState("");
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setBreakpoint("sm");
      } else if (width < 768) {
        setBreakpoint("md");
      } else if (width < 1024) {
        setBreakpoint("lg");
      } else if (width < 1280) {
        setBreakpoint("xl");
      } else {
        setBreakpoint("2xl");
      }
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  
  return breakpoint;
};

// Component that shows different content based on screen size
export const Responsive = ({ 
  children, 
  breakpoint = "md" // "sm", "md", "lg", "xl", "2xl"
}) => {
  const currentBreakpoint = useBreakpoint();
  const breakpoints = ["sm", "md", "lg", "xl", "2xl"];
  
  const shouldRender = () => {
    const currentIndex = breakpoints.indexOf(currentBreakpoint);
    const targetIndex = breakpoints.indexOf(breakpoint);
    
    return currentIndex >= targetIndex;
  };
  
  return shouldRender() ? children : null;
};

// Animated mobile menu that appears on small screens
export const MobileMenu = ({ 
  isOpen, 
  onClose, 
  children,
  position = "right" // "left", "right", "bottom"
}) => {
  const variants = {
    left: {
      open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
      closed: { x: "-100%", transition: { type: "spring", stiffness: 300, damping: 30 } }
    },
    right: {
      open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
      closed: { x: "100%", transition: { type: "spring", stiffness: 300, damping: 30 } }
    },
    bottom: {
      open: { y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
      closed: { y: "100%", transition: { type: "spring", stiffness: 300, damping: 30 } }
    }
  };

  const positionClass = 
    position === "left" ? "left-0 top-0 bottom-0 w-64" :
    position === "right" ? "right-0 top-0 bottom-0 w-64" :
    "left-0 right-0 bottom-0 h-64";

  return (
    <>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <motion.div
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={variants[position]}
        className={`fixed ${positionClass} bg-white shadow-lg z-50 overflow-y-auto`}
      >
        {children}
      </motion.div>
    </>
  );
};

// Responsive table that adapts to small screens
export const ResponsiveTable = ({ headers, rows, className = "" }) => {
  const currentBreakpoint = useBreakpoint();
  const isMobile = currentBreakpoint === "sm";
  
  if (isMobile) {
    return (
      <div className={`space-y-4 ${className}`}>
        {rows.map((row, rowIndex) => (
          <motion.div
            key={rowIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: rowIndex * 0.05 }}
            className="bg-white rounded-lg shadow-sm p-4 border border-border"
          >
            {headers.map((header, colIndex) => (
              <div key={colIndex} className="flex justify-between py-2 border-b border-border last:border-0">
                <span className="font-medium text-gray-500">{header}</span>
                <span className="text-gray-900">{row[colIndex]}</span>
              </div>
            ))}
          </motion.div>
        ))}
      </div>
    );
  }
  
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-border">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th 
                key={index}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-border">
          {rows.map((row, rowIndex) => (
            <motion.tr
              key={rowIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: rowIndex * 0.05 }}
            >
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {cell}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};