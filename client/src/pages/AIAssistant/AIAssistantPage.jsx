import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../../store';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMessageCircle as ChatIcon,
  FiTrash2 as DeleteIcon, 
  FiSettings as SettingsIcon, 
  FiStar as StarIcon, 
  FiChevronDown as ChevronDownIcon, 
  FiLock as LockIcon, 
  FiUnlock as UnlockIcon, 
  FiEdit as EditIcon, 
  FiPlus as AddIcon,
  FiSend as SendIcon,
  FiCommand as CommandIcon,
  FiSearch as SearchIcon,
  FiX as CloseIcon
} from 'react-icons/fi';
import { RiRobotFill as RobotIcon } from 'react-icons/ri';

import aiAssistantService from '../../services/aiAssistantService';
import learningPlanService from '../../services/learningPlanService';
import ConversationItem from '../../components/AIAssistant/ConversationItem';
import AIMessage from '../../components/AIAssistant/AIMessage';
import TypingIndicator from '../../components/AIAssistant/TypingIndicator';

const AIAssistantPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useStore();
  const messageEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentConversation, setCurrentConversation] = useState(null);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [learningPlans, setLearningPlans] = useState([]);
  const [selectedPlans, setSelectedPlans] = useState([]);
  const [editingTitle, setEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [showPlansMenu, setShowPlansMenu] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  const suggestions = [
    "Explain how React's useState hook works",
    "What are the best practices for RESTful API design?",
    "Give me a quick introduction to machine learning algorithms",
    "Help me understand CSS Grid vs Flexbox"
  ];
  
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await aiAssistantService.getUserConversations();
        if (!response.error) {
          setConversations(response.data || []);
          setFilteredConversations(response.data || []);
        }
      } catch (error) {
        toast.error('Failed to load conversations');
      } finally {
        setLoadingConversations(false);
      }
    };
    
    const fetchLearningPlans = async () => {
      try {
        const response = await learningPlanService.getUserPlans();
        if (!response.error) {
          setLearningPlans(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching learning plans:', error);
      }
    };
    
    fetchConversations();
    fetchLearningPlans();
  }, []);
  
  useEffect(() => {
    if (!searchQuery) {
      setFilteredConversations(conversations);
      return;
    }
    
    const filtered = conversations.filter(conv => 
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (conv.messages && conv.messages.some(msg => 
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      ))
    );
    
    setFilteredConversations(filtered);
  }, [searchQuery, conversations]);
  
  useEffect(() => {
    const fetchConversation = async () => {
      if (conversationId) {
        try {
          setIsLoading(true);
          const response = await aiAssistantService.getConversation(conversationId);
          if (!response.error) {
            setCurrentConversation(response.data);
            setNewTitle(response.data.title);
            setSelectedPlans(response.data.relatedLearningPlanIds || []);
            setMobileSidebarOpen(false);
          } else {
            toast.error('Failed to load conversation');
            navigate('/ai-assistant');
          }
        } catch (error) {
          toast.error('Failed to load conversation');
          navigate('/ai-assistant');
        } finally {
          setIsLoading(false);
        }
      } else {
        setCurrentConversation(null);
      }
    };
    
    fetchConversation();
  }, [conversationId, navigate]);
  
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation]);
  
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading, currentConversation]);
  
  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    
    try {
      setIsLoading(true);
      setShowSuggestions(false);
      
      const response = await aiAssistantService.askQuestion(
        question, 
        currentConversation?.id, 
        selectedPlans
      );
      
      if (!response.error) {
        setCurrentConversation(response.data);
        
        if (!currentConversation) {
          setConversations([response.data, ...conversations]);
          setFilteredConversations([response.data, ...filteredConversations]);
          navigate(`/ai-assistant/${response.data.id}`);
        }
        
        setQuestion('');
      } else {
        toast.error('Failed to get AI response');
      }
    } catch (error) {
      toast.error('Failed to get AI response');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNewConversation = () => {
    setCurrentConversation(null);
    setShowSuggestions(true);
    navigate('/ai-assistant');
    setQuestion('');
    setSelectedPlans([]);
    setMobileSidebarOpen(false);
  };
  
  const handleDeleteConversation = async (id) => {
    try {
      const response = await aiAssistantService.deleteConversation(id);
      if (!response.error) {
        toast.success('Conversation deleted');
        const updatedConversations = conversations.filter(conv => conv.id !== id);
        setConversations(updatedConversations);
        setFilteredConversations(updatedConversations.filter(conv => 
          !searchQuery || 
          conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (conv.messages && conv.messages.some(msg => 
            msg.content.toLowerCase().includes(searchQuery.toLowerCase())
          ))
        ));
        
        if (currentConversation?.id === id) {
          navigate('/ai-assistant');
        }
      } else {
        toast.error('Failed to delete conversation');
      }
    } catch (error) {
      toast.error('Failed to delete conversation');
    }
  };
  
  const handleTogglePublic = async () => {
    if (!currentConversation) return;
    
    try {
      const response = await aiAssistantService.togglePublicStatus(currentConversation.id);
      if (!response.error) {
        const updatedConversation = {
          ...currentConversation,
          isPublic: !currentConversation.isPublic
        };
        
        setCurrentConversation(updatedConversation);
        
        setConversations(conversations.map(conv => 
          conv.id === currentConversation.id ? updatedConversation : conv
        ));
        setFilteredConversations(filteredConversations.map(conv => 
          conv.id === currentConversation.id ? updatedConversation : conv
        ));
        
        toast.success(`Conversation is now ${!currentConversation.isPublic ? 'public' : 'private'}`);
      }
    } catch (error) {
      toast.error('Failed to update visibility');
    }
  };
  
  const handleUpvote = async () => {
    if (!currentConversation) return;
    
    try {
      const response = await aiAssistantService.upvoteConversation(currentConversation.id);
      if (!response.error) {
        const isUpvoted = currentConversation.upvotedBy?.includes(user?.id);
        const newUpvotes = isUpvoted 
          ? currentConversation.upvotes - 1 
          : currentConversation.upvotes + 1;
          
        const updatedConversation = {
          ...currentConversation,
          upvotes: newUpvotes,
          upvotedBy: isUpvoted 
            ? currentConversation.upvotedBy.filter(id => id !== user?.id)
            : [...(currentConversation.upvotedBy || []), user?.id]
        };
        
        setCurrentConversation(updatedConversation);
        
        setConversations(conversations.map(conv => 
          conv.id === currentConversation.id ? updatedConversation : conv
        ));
        setFilteredConversations(filteredConversations.map(conv => 
          conv.id === currentConversation.id ? updatedConversation : conv
        ));
      }
    } catch (error) {
      toast.error('Failed to update upvote');
    }
  };
  
  const handleTitleUpdate = async () => {
    if (!currentConversation || !newTitle.trim()) return;
    
    try {
      const response = await aiAssistantService.updateConversation(
        currentConversation.id, 
        { title: newTitle }
      );
      
      if (!response.error) {
        const updatedConversation = {
          ...currentConversation,
          title: newTitle
        };
        
        setCurrentConversation(updatedConversation);
        
        setConversations(conversations.map(conv => 
          conv.id === currentConversation.id ? updatedConversation : conv
        ));
        setFilteredConversations(filteredConversations.map(conv => 
          conv.id === currentConversation.id ? updatedConversation : conv
        ));
        
        setEditingTitle(false);
        toast.success('Title updated');
      }
    } catch (error) {
      toast.error('Failed to update title');
    }
  };
  
  const handleToggleLearningPlan = (planId) => {
    if (selectedPlans.includes(planId)) {
      setSelectedPlans(selectedPlans.filter(id => id !== planId));
    } else {
      setSelectedPlans([...selectedPlans, planId]);
    }
  };
  
  const updateRelatedPlans = async () => {
    if (!currentConversation) return;
    
    try {
      const response = await aiAssistantService.updateConversation(
        currentConversation.id,
        { relatedLearningPlanIds: selectedPlans }
      );
      
      if (!response.error) {
        setCurrentConversation({
          ...currentConversation,
          relatedLearningPlanIds: selectedPlans
        });
        toast.success('Related learning plans updated');
        setShowPlansMenu(false);
      }
    } catch (error) {
      toast.error('Failed to update related plans');
    }
  };
  
  const useSuggestion = (suggestion) => {
    setQuestion(suggestion);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden flex flex-col md:flex-row">
      <div className="md:hidden p-2 bg-light dark:bg-dark border-b border-separator dark:border-muted/30 flex items-center justify-between">
        <button 
          className="p-2 rounded-lg hover:bg-secondary dark:hover:bg-muted/20"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        >
          {mobileSidebarOpen ? <CloseIcon /> : <ChatIcon />}
          <span className="ml-2">Conversations</span>
        </button>
        <button
          className="p-2 rounded-lg bg-primary hover:bg-primary/90 text-light"
          onClick={handleNewConversation}
        >
          <AddIcon className="mr-1" /> New Chat
        </button>
      </div>
      
      <AnimatePresence>
        {(mobileSidebarOpen || window.innerWidth >= 768) && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`md:w-[300px] w-full ${mobileSidebarOpen ? 'absolute z-50 h-[calc(100vh-96px)]' : 'h-full'} bg-light dark:bg-dark overflow-y-auto border-r border-separator dark:border-muted/30 md:block ${mobileSidebarOpen ? 'block' : 'hidden'}`}
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold flex items-center">
                  <RobotIcon className="mr-2 text-primary" size={20} />
                  AI Assistant
                </h2>
                <button
                  aria-label="New conversation"
                  className="p-2 rounded-lg bg-primary hover:bg-primary/90 text-light flex items-center"
                  onClick={handleNewConversation}
                >
                  <AddIcon size={16} className="mr-1" />
                  <span className="text-sm">New Chat</span>
                </button>
              </div>
              
              <div className="mb-4 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="text-muted" size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-separator dark:border-muted/30 rounded-lg bg-secondary dark:bg-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                />
                {searchQuery && (
                  <button
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setSearchQuery('')}
                  >
                    <CloseIcon className="text-muted hover:text-dark dark:hover:text-light" size={16} />
                  </button>
                )}
              </div>
              
              <div className="border-t border-separator dark:border-muted/30 pt-4">
                <h3 className="text-xs uppercase tracking-wider text-muted dark:text-muted mb-3 px-2">
                  Your Conversations
                </h3>
                
                {loadingConversations ? (
                  <div className="flex justify-center mt-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center py-6">
                    {searchQuery ? (
                      <div>
                        <p className="text-muted dark:text-muted mb-2">No conversations found</p>
                        <p className="text-sm text-muted dark:text-muted">Try a different search term</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-muted dark:text-muted mb-2">No conversations yet</p>
                        <p className="text-sm text-muted dark:text-muted">Start a new chat to get help</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredConversations.map(conversation => (
                      <ConversationItem
                        key={conversation.id}
                        conversation={conversation}
                        isActive={currentConversation?.id === conversation.id}
                        onDelete={() => handleDeleteConversation(conversation.id)}
                        onClick={() => navigate(`/ai-assistant/${conversation.id}`)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {currentConversation ? (
          <>
            <div className="bg-light dark:bg-dark border-b border-separator dark:border-muted/30 p-3">
              <div className="flex justify-between items-center">
                {editingTitle ? (
                  <div className="flex items-center">
                    <input 
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleTitleUpdate();
                      }}
                      className="mr-2 px-2 py-1 border border-separator dark:border-muted/30 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <button 
                      className="px-2 py-1 text-sm bg-primary text-light rounded-md"
                      onClick={handleTitleUpdate}
                    >
                      Save
                    </button>
                    <button 
                      className="px-2 py-1 ml-2 text-sm text-dark dark:text-light bg-secondary dark:bg-muted/20 rounded-md"
                      onClick={() => {
                        setEditingTitle(false);
                        setNewTitle(currentConversation.title);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <h2 className="text-lg font-medium flex items-center truncate">
                    <ChatIcon className="mr-2 flex-shrink-0 text-primary" />
                    <span className="truncate">{currentConversation.title}</span>
                    <button
                      aria-label="Edit title"
                      className="ml-2 p-1 text-muted hover:text-dark dark:hover:text-light rounded-full hover:bg-secondary dark:hover:bg-muted/20"
                      onClick={() => setEditingTitle(true)}
                    >
                      <EditIcon size={14} />
                    </button>
                  </h2>
                )}
                
                <div className="flex">
                  <button
                    aria-label={currentConversation.isPublic ? "Make private" : "Make public"}
                    className="mr-2 p-1.5 rounded-full hover:bg-secondary dark:hover:bg-muted/20"
                    onClick={handleTogglePublic}
                    title={currentConversation.isPublic ? "Make private" : "Make public"}
                  >
                    {currentConversation.isPublic ? <UnlockIcon /> : <LockIcon />}
                  </button>
                  
                  <button
                    aria-label="Upvote"
                    className={`mr-2 p-1.5 rounded-full hover:bg-secondary dark:hover:bg-muted/20 ${
                      currentConversation.upvotedBy?.includes(user?.id) ? 'text-yellow-500' : 'text-muted'
                    }`}
                    onClick={handleUpvote}
                    title="Upvote this conversation"
                  >
                    <StarIcon />
                  </button>
                  
                  <div className="relative">
                    <button 
                      className="p-1.5 rounded-full hover:bg-secondary dark:hover:bg-muted/20"
                      onClick={() => setShowPlansMenu(!showPlansMenu)}
                    >
                      <SettingsIcon />
                    </button>
                    {showPlansMenu && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 z-20 mt-2 w-64 bg-light dark:bg-dark rounded-lg shadow-lg py-2 overflow-hidden border border-separator dark:border-muted/30"
                      >
                        <button 
                          className="w-full px-4 py-2 text-sm text-left text-dark dark:text-light hover:bg-secondary dark:hover:bg-muted/20 flex items-center"
                          onClick={() => setEditingTitle(true)}
                        >
                          <EditIcon className="mr-2" /> Edit Title
                        </button>
                        <button 
                          className="w-full px-4 py-2 text-sm text-left text-dark dark:text-light hover:bg-secondary dark:hover:bg-muted/20 flex items-center"
                          onClick={handleTogglePublic}
                        >
                          {currentConversation.isPublic ? <LockIcon className="mr-2" /> : <UnlockIcon className="mr-2" />}
                          {currentConversation.isPublic ? "Make Private" : "Make Public"}
                        </button>
                        <div className="border-t border-separator dark:border-muted/30 my-1"></div>
                        <div className="px-4 py-2">
                          <h3 className="text-sm font-medium mb-2">Related Learning Plans</h3>
                          <div className="max-h-48 overflow-y-auto">
                            {learningPlans.length === 0 ? (
                              <div className="text-sm text-muted italic">No learning plans available</div>
                            ) : (
                              learningPlans.map(plan => (
                                <div 
                                  key={plan.id}
                                  className="flex items-center mb-2 last:mb-0"
                                >
                                  <input
                                    type="checkbox"
                                    id={`plan-${plan.id}`}
                                    checked={selectedPlans.includes(plan.id)}
                                    onChange={() => handleToggleLearningPlan(plan.id)}
                                    className="mr-2 rounded text-primary"
                                  />
                                  <label 
                                    htmlFor={`plan-${plan.id}`}
                                    className="text-sm cursor-pointer truncate max-w-[200px] text-dark dark:text-light"
                                  >
                                    {plan.title}
                                  </label>
                                </div>
                              ))
                            )}
                          </div>
                          {selectedPlans.length > 0 && (
                            <button 
                              className="mt-3 w-full px-3 py-1.5 bg-primary hover:bg-primary/90 text-light text-sm rounded"
                              onClick={updateRelatedPlans}
                            >
                              Save Related Plans
                            </button>
                          )}
                        </div>
                        <div className="border-t border-separator dark:border-muted/30 my-1"></div>
                        <button 
                          className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center"
                          onClick={() => handleDeleteConversation(currentConversation.id)}
                        >
                          <DeleteIcon className="mr-2" /> Delete Conversation
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-secondary dark:bg-dark/50">
              <div className="max-w-3xl mx-auto">
                {currentConversation.messages.map((message, index) => (
                  <AIMessage 
                    key={index}
                    message={message}
                    isUser={message.role === 'user'}
                  />
                ))}
                {isLoading && <TypingIndicator />}
                <div ref={messageEndRef} />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto bg-secondary dark:bg-dark/50">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-xl w-full text-center"
            >
              <div className="mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.2
                  }}
                  className="w-20 h-20 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto"
                >
                  <RobotIcon size={36} className="text-primary" />
                </motion.div>
              </div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold mb-3 text-dark dark:text-light"
              >
                EduPulse AI Learning Assistant
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-muted dark:text-muted mb-8 max-w-md mx-auto"
              >
                Ask any questions about your courses, get help with assignments, or explore new topics. Your AI assistant is here to help you learn!
              </motion.p>
              
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8"
                >
                  {suggestions.map((suggestion, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + (index * 0.1) }}
                      className="p-3 border border-separator dark:border-muted/30 rounded-lg bg-light dark:bg-dark hover:border-primary/30 dark:hover:border-primary/50 hover:shadow-sm cursor-pointer text-left transition-all"
                      onClick={() => useSuggestion(suggestion)}
                    >
                      <div className="flex items-center">
                        <CommandIcon size={14} className="text-muted mr-2 flex-shrink-0" />
                        <p className="text-sm text-dark dark:text-light">{suggestion}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
        
        <div className="bg-light dark:bg-dark border-t border-separator dark:border-muted/30 p-3 md:p-4">
          <div className="max-w-3xl mx-auto">
            {selectedPlans.length > 0 && (
              <div className="mb-3 flex flex-wrap">
                {selectedPlans.map(planId => {
                  const plan = learningPlans.find(p => p.id === planId);
                  return plan ? (
                    <motion.div 
                      key={planId} 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 text-primary dark:text-primary/90 text-xs px-2 py-1 rounded-full mr-2 mb-2 flex items-center"
                    >
                      {plan.title}
                      <button
                        aria-label="Remove plan"
                        className="ml-1.5 text-primary/90 hover:text-primary dark:text-primary/80 dark:hover:text-primary/100"
                        onClick={() => handleToggleLearningPlan(planId)}
                      >
                        <CloseIcon size={12} />
                      </button>
                    </motion.div>
                  ) : null;
                })}
              </div>
            )}
            
            <div className="flex items-end">
              <div className="flex-1 relative">
                <textarea 
                  ref={inputRef}
                  placeholder="Ask your question here... (e.g., 'Explain React hooks')" 
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full border border-separator dark:border-muted/30 rounded-2xl pl-4 pr-12 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm bg-light dark:bg-dark min-h-[3.5rem] max-h-32"
                  rows={question.split('\n').length > 3 ? 4 : Math.max(1, question.split('\n').length)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.shiftKey === false) {
                      e.preventDefault();
                      handleAskQuestion();
                    }
                  }}
                />
                <div className="absolute right-3 bottom-3">
                  <button 
                    className={`p-2 rounded-full ${
                      question.trim() 
                        ? 'bg-primary text-light hover:bg-primary/90' 
                        : 'bg-secondary text-muted dark:bg-muted/20 dark:text-muted cursor-not-allowed'
                    }`}
                    onClick={handleAskQuestion}
                    disabled={!question.trim() || isLoading}
                    aria-label="Send message"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent border-light"></div>
                    ) : (
                      <SendIcon size={16} />
                    )}
                  </button>
                </div>
              </div>
              
              {learningPlans.length > 0 && (
                <div className="ml-2">
                  <button
                    className={`p-2 rounded-lg border ${
                      selectedPlans.length > 0 
                        ? 'border-primary/30 bg-primary/10 text-primary dark:border-primary/50 dark:bg-primary/20 dark:text-primary/90'
                        : 'border-separator bg-light text-muted dark:border-muted/30 dark:bg-dark dark:text-muted'
                    } hover:border-primary/40`}
                    onClick={() => setShowPlansMenu(!showPlansMenu)}
                    title="Connect learning plans to this conversation"
                  >
                    <SettingsIcon size={18} />
                  </button>
                </div>
              )}
            </div>
            
            <div className="mt-2 text-xs text-muted dark:text-muted flex items-center justify-between">
              <div>
                <span className="flex items-center">
                  <ShiftEnterIcon className="mr-1" /> Press Shift + Enter for a new line
                </span>
              </div>
              <div>
                AI responses are generated and may not always be accurate.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ShiftEnterIcon = ({ className }) => (
  <div className={`inline-flex items-center ${className || ''}`}>
    <kbd className="px-1 py-0.5 text-xs bg-secondary dark:bg-muted/20 rounded mr-1">⇧</kbd>
    <span>+</span>
    <kbd className="px-1 py-0.5 text-xs bg-secondary dark:bg-muted/20 rounded ml-1">↵</kbd>
  </div>
);

export default AIAssistantPage;