import React, { useEffect } from 'react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import { motion } from 'framer-motion';
import { FiUser as UserIcon, FiCheckCircle as CheckIcon } from 'react-icons/fi';
import { RiRobot2Fill as AIIcon } from 'react-icons/ri';

const AIMessage = ({ message, isUser }) => {
  // Apply syntax highlighting to code blocks after rendering
  useEffect(() => {
    if (!isUser) {
      document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
      });
    }
  }, [message, isUser]);

  // Format timestamp for display
  const formatTimestamp = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return format(date, 'h:mm a');
  };
  
  return (
    <motion.div 
      className={`mb-6 flex ${isUser ? 'justify-end' : 'justify-start'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {!isUser && (
        <div 
          className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 text-white mr-3 shadow-sm"
        >
          <AIIcon size={20} />
        </div>
      )}
      
      <div
        className={`max-w-[85%] rounded-2xl shadow-sm ${
          isUser 
            ? 'bg-gradient-to-r from-accent to-accent/90 text-white rounded-tr-sm' 
            : 'bg-light dark:bg-dark border border-separator dark:border-muted/30 rounded-tl-sm'
        }`}
      >
        <div className={`p-4 ${!isUser ? 'dark:text-light' : ''}`}>
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <div className="markdown-content prose dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  code({node, inline, className, children, ...props}) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <div className="code-block-container relative">
                        <div className="code-header bg-dark text-xs text-muted py-1 px-4 rounded-t-md flex items-center justify-between">
                          <span>{match[1].toUpperCase()}</span>
                          <button 
                            className="copy-button text-muted hover:text-light transition-colors"
                            onClick={() => {
                              navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                              const copyBtn = event.currentTarget;
                              copyBtn.innerHTML = '<CheckIcon size={12} /> Copied!';
                              setTimeout(() => {
                                copyBtn.innerHTML = 'Copy';
                              }, 2000);
                            }}
                          >
                            Copy
                          </button>
                        </div>
                        <pre className="rounded-t-none mt-0 !bg-dark">
                          <code className={`language-${match[1]}`} {...props}>
                            {String(children).replace(/\n$/, '')}
                          </code>
                        </pre>
                      </div>
                    ) : (
                      <code className={`${className} bg-secondary dark:bg-muted/20 px-1.5 py-0.5 rounded text-sm`} {...props}>
                        {children}
                      </code>
                    );
                  },
                  p({children}) {
                    return <p className="mb-4 last:mb-0">{children}</p>;
                  },
                  ul({children}) {
                    return <ul className="list-disc pl-6 mb-4 last:mb-0">{children}</ul>;
                  },
                  ol({children}) {
                    return <ol className="list-decimal pl-6 mb-4 last:mb-0">{children}</ol>;
                  },
                  h1({children}) {
                    return <h1 className="text-xl font-bold mb-2">{children}</h1>;
                  },
                  h2({children}) {
                    return <h2 className="text-lg font-bold mb-2">{children}</h2>;
                  },
                  h3({children}) {
                    return <h3 className="text-md font-bold mb-2">{children}</h3>;
                  },
                  blockquote({children}) {
                    return <blockquote className="border-l-4 border-separator dark:border-muted/40 pl-3 italic my-3">{children}</blockquote>;
                  }
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        
        <div
          className={`text-xs ${isUser ? 'text-light/80' : 'text-muted dark:text-muted'} px-4 pb-2`}
        >
          {formatTimestamp(message.timestamp)}
        </div>
      </div>
      
      {isUser && (
        <div 
          className="flex items-center justify-center h-10 w-10 rounded-full bg-secondary dark:bg-muted/20 ml-3 shadow-sm"
        >
          <UserIcon size={16} className="text-muted dark:text-light/70" />
        </div>
      )}
    </motion.div>
  );
};

export default AIMessage;