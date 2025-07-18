import React from "react";
import { motion } from "framer-motion";

interface AnimatedPlusIconProps {
  className?: string;
  size?: number;
}

export const AnimatedPlusIcon: React.FC<AnimatedPlusIconProps> = ({ 
  className = "", 
  size = 24 
}) => {
  return (
    <motion.div
      className={`inline-block ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        rotate: [0, -5, 5, -5, 0],
      }}
      transition={{
        opacity: { duration: 0.6, ease: "easeOut" },
        y: { duration: 0.6, ease: "easeOut" },
        rotate: {
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity,
          repeatDelay: 3,
        }
      }}
      whileHover={{
        scale: 1.1,
        rotate: [0, -10, 10, -10, 0],
        transition: {
          scale: { duration: 0.2 },
          rotate: { duration: 0.5, ease: "easeInOut" }
        }
      }}
      whileTap={{ scale: 0.95 }}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="currentColor"
        className="drop-shadow-lg"
      >
        <g clipPath="url(#clip0_4418_8497)">
          <motion.path 
            d="M20.5 10.19H17.61C15.24 10.19 13.31 8.26 13.31 5.89V3C13.31 2.45 12.86 2 12.31 2H8.07C4.99 2 2.5 4 2.5 7.57V16.43C2.5 20 4.99 22 8.07 22H15.93C19.01 22 21.5 20 21.5 16.43V11.19C21.5 10.64 21.05 10.19 20.5 10.19Z" 
            fill="currentColor"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ 
              pathLength: { duration: 1.5, ease: "easeInOut" },
              opacity: { duration: 0.5 }
            }}
          />
          <motion.path 
            d="M15.7999 2.21048C15.3899 1.80048 14.6799 2.08048 14.6799 2.65048V6.14048C14.6799 7.60048 15.9199 8.81048 17.4299 8.81048C18.3799 8.82048 19.6999 8.82048 20.8299 8.82048C21.3999 8.82048 21.6999 8.15048 21.2999 7.75048C19.8599 6.30048 17.2799 3.69048 15.7999 2.21048Z" 
            fill="currentColor"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ 
              pathLength: { duration: 1.5, ease: "easeInOut", delay: 0.3 },
              opacity: { duration: 0.5, delay: 0.3 }
            }}
          />
        </g>
        <defs>
          <clipPath id="clip0_4418_8497">
            <rect width="24" height="24" fill="white"/>
          </clipPath>
        </defs>
      </svg>
    </motion.div>
  );
};