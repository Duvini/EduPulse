import React from 'react';
import { motion } from 'framer-motion';
import { RiRobot2Fill as AIIcon } from 'react-icons/ri';

const TypingIndicator = () => {
  return (
    <div className="mb-6 flex justify-start">
      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 text-light mr-3 shadow-sm">
        <AIIcon size={20} />
      </div>
      <motion.div 
        className="bg-light dark:bg-dark border border-separator dark:border-muted/30 rounded-2xl rounded-tl-sm p-4 shadow-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex space-x-2">
          <motion.div
            className="h-2 w-2 rounded-full bg-primary"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.2 }}
          />
          <motion.div
            className="h-2 w-2 rounded-full bg-primary"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.2, delay: 0.2 }}
          />
          <motion.div
            className="h-2 w-2 rounded-full bg-primary"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.2, delay: 0.4 }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default TypingIndicator;