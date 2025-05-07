import React, { useState } from "react";
import LearnPlanTask from "./LearningPlanTask";
import { learningPlanService } from "../../services/learningPlanService";
import { useNavigate } from "react-router-dom";

const LearnPlanMain = ({ plan, onUpdate, onDelete }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTaskStatusChange = async (taskIndex, isCompleted) => {
    try {
      setLoading(true);
      const response = await learningPlanService.updateTaskStatus(plan.id, taskIndex, isCompleted);
      if (!response.error) {
        // Instead of calling onUpdate which navigates away, just update the plan locally
        const updatedTasks = [...plan.tasks];
        updatedTasks[taskIndex].completed = isCompleted;
        plan.tasks = updatedTasks;
        // Force a re-render by updating the state
        setLoading(false);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this learning plan? This action cannot be undone.')) {
      try {
        const response = await learningPlanService.deletePlan(plan.id);
        if (!response.error) {
          onDelete(plan.id);
        }
      } catch (error) {
        console.error('Error deleting plan:', error);
      }
    }
  };

  const progress = calculateProgress(plan.tasks);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-200 hover:shadow-xl">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-800">{plan.title}</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getProgressColor(progress)}`}>
            {progress}%
          </span>
        </div>
        
        <p className="text-gray-600 mb-4">{plan.description}</p>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div 
            className={`h-2.5 rounded-full transition-all duration-500 ${getProgressBarColor(progress)}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {getCompletedTasks(plan.tasks)} / {plan.tasks.length} Tasks Completed
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Created on {formatDate(plan.createdAt)}
          </div>
        </div>
      </div>
      
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm transition duration-200"
            >
              View Tasks
            </button>
            <button
              onClick={() => navigate(`/update-plan/${plan.id}`)}
              className="text-gray-600 hover:text-gray-800 text-sm transition duration-200"
            >
              Edit Plan
            </button>
          </div>
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800 text-sm transition duration-200"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">{plan.title} - Tasks</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-4">
                {plan.tasks.map((task, index) => (
                  <LearnPlanTask
                    key={index}
                    task={task}
                    index={index}
                    planId={plan.id}
                    onStatusChange={(isCompleted) => handleTaskStatusChange(index, isCompleted)}
                    loading={loading}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const getProgressColor = (progress) => {
  if (progress === 100) return 'bg-green-100 text-green-800';
  if (progress >= 75) return 'bg-blue-100 text-blue-800';
  if (progress >= 50) return 'bg-yellow-100 text-yellow-800';
  if (progress >= 25) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
};

const getProgressBarColor = (progress) => {
  if (progress === 100) return 'bg-green-600';
  if (progress >= 75) return 'bg-blue-600';
  if (progress >= 50) return 'bg-yellow-600';
  if (progress >= 25) return 'bg-orange-600';
  return 'bg-red-600';
};

const getCompletedTasks = (tasks) => {
  return tasks.filter(task => task.completed).length;
};

const calculateProgress = (tasks) => {
  if (!tasks || tasks.length === 0) return 0;
  const completedTasks = tasks.filter(task => task.completed).length;
  return Math.round((completedTasks / tasks.length) * 100);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default LearnPlanMain;