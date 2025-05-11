import React from 'react';
import { FiTrash2, FiMessageCircle, FiLock, FiUnlock, FiStar } from 'react-icons/fi';
import { formatDistanceToNow, format } from 'date-fns';
import { motion } from 'framer-motion';

const ConversationItem = ({ conversation, isActive, onClick, onDelete }) => {
  
  // Format the date for display and tooltip
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return formatDistanceToNow(date, { addSuffix: true });
  };
  
  const getDetailedDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return format(date, 'PPpp'); // e.g., "Apr 29, 2023, 3:30 PM"
  };
  
  // Get the first message content as a preview
  const getMessagePreview = () => {
    if (!conversation.messages || conversation.messages.length === 0) {
      return 'No messages yet';
    }
    
    // Find the first AI message, or use the first message if no AI messages
    const firstAiMessage = conversation.messages.find(msg => msg.role === 'assistant');
    const firstMessage = firstAiMessage || conversation.messages[0];
    
    // Truncate to reasonable length
    const content = firstMessage.content || '';
    return content.length > 60 ? content.substring(0, 60) + '...' : content;
  };
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`p-3 mb-2 rounded-lg border transition-all duration-200 ${
        isActive 
          ? 'bg-primary/10 dark:bg-primary/20 border-primary/20 dark:border-primary/30 shadow-sm'
          : 'bg-light dark:bg-dark border-separator dark:border-muted/30 hover:border-primary/30 dark:hover:border-primary/40 hover:shadow-sm'
      } cursor-pointer relative group`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center max-w-[80%]">
          <div className={`p-1.5 mr-3 rounded-full ${isActive ? 'bg-primary/20 dark:bg-primary/30' : 'bg-secondary dark:bg-muted/20'}`}>
            <FiMessageCircle 
              className={`${isActive ? 'text-primary dark:text-primary/90' : 'text-muted dark:text-muted'}`} 
              size={14}
            />
          </div>
          <span 
            className={`truncate ${isActive 
              ? 'font-medium text-primary dark:text-primary/90' 
              : 'font-normal text-dark dark:text-light'}`}
          >
            {conversation.title}
          </span>
        </div>
        
        <button
          className="p-1.5 text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
          aria-label="Delete conversation"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <FiTrash2 size={14} />
        </button>
      </div>
      
      <div className="mt-1 pl-8 text-xs text-muted dark:text-muted line-clamp-1">
        {getMessagePreview()}
      </div>
      
      <div className="mt-2 pl-8 text-xs text-muted dark:text-muted flex items-center">
        <div title={getDetailedDate(conversation.updatedAt)} className="mr-2">
          {formatDate(conversation.updatedAt)}
        </div>
        
        {conversation.isPublic ? (
          <div title="Public conversation" className="mr-2 flex items-center">
            <FiUnlock size={10} className="mr-1" />
            <span className="text-[10px]">Public</span>
          </div>
        ) : (
          <div title="Private conversation" className="mr-2 flex items-center">
            <FiLock size={10} className="mr-1" />
            <span className="text-[10px]">Private</span>
          </div>
        )}
        
        {conversation.upvotes > 0 && (
          <div title={`${conversation.upvotes} upvotes`} className="flex items-center">
            <FiStar size={10} className="text-yellow-500 mr-1" />
            <span className="text-[10px]">{conversation.upvotes}</span>
          </div>
        )}
        
        {conversation.messages && (
          <div className="ml-auto px-1.5 py-0.5 bg-secondary dark:bg-muted/30 text-muted dark:text-muted/80 rounded-full text-[10px]">
            {conversation.messages.length} messages
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ConversationItem;