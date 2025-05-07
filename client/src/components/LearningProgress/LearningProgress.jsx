import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { learningPlanService } from '../../services/learningPlanService';
import { useStore } from '../../../store';

const LearningProgress = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const { user } = useStore();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      // If user is logged in, get their specific plans
      const response = user && user.id
        ? await learningPlanService.getUserPlans(user.id)
        : await learningPlanService.getAllPlans();
      
      if (!response.error) {
        const planData = response.data.error === false ? response.data.data : [];
        setPlans(Array.isArray(planData) ? planData : [planData]);
      } else {
        console.error('Error in response:', response.error);
        setMessage('Error loading learning plans');
      }
    } catch (error) {
      console.error('Error fetching learning plans:', error);
      setMessage('Error loading learning plans');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (planId) => {
    if (window.confirm('Are you sure you want to delete this learning plan?')) {
      try {
        const response = await learningPlanService.deletePlan(planId);
        if (!response.error) {
          setMessage('Learning plan deleted successfully');
          // Remove the deleted plan from the state
          setPlans(plans.filter(plan => plan.id !== planId));
        } else {
          setMessage('Error deleting learning plan');
        }
      } catch (error) {
        console.error('Error deleting learning plan:', error);
        setMessage('Error deleting learning plan');
      }
    }
  };

  const calculateProgress = (tasks) => {
    if (!tasks || tasks.length === 0) return 0;
    const completedTasks = tasks.filter(task => task.completed).length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4 p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
      {message && (
        <div className={`px-4 py-2 ${message.includes('successfully') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message}
        </div>
      )}
      
      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-base font-semibold">Learning Progress</h3>
        <Link 
          to="/create-plan"
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          Create Plan
        </Link>
      </div>
      
      <div className="divide-y divide-gray-200">
        {plans.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <p className="text-gray-500">No learning plans found.</p>
            <Link 
              to="/create-plan"
              className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Create your first learning plan
            </Link>
          </div>
        ) : (
          plans.map(plan => {
            const progress = calculateProgress(plan.tasks);
            return (
              <div key={plan.id} className="px-4 py-3">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded mr-3 bg-blue-100 flex items-center justify-center text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-medium text-gray-900 truncate">{plan.title}</p>
                      <button
                        onClick={() => handleDelete(plan.id)}
                        className="text-red-600 hover:text-red-800 text-sm ml-2"
                        title="Delete plan"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {plan.tasks.filter(t => t.completed).length} of {plan.tasks.length} tasks completed
                    </p>
                    
                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${getProgressBarColor(progress)}`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium">{progress}% complete</span>
                      <Link 
                        to={`/update-plan/${plan.id}`}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Continue
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      <div className="px-4 py-3 text-center border-t border-gray-200">
        <Link 
          to="/learning-plans" 
          className="text-sm text-blue-600 font-medium hover:text-blue-800"
        >
          View all plans
        </Link>
      </div>
    </div>
  );
};

const getProgressBarColor = (progress) => {
  if (progress === 100) return 'bg-green-600';
  if (progress >= 75) return 'bg-blue-600';
  if (progress >= 50) return 'bg-yellow-600';
  if (progress >= 25) return 'bg-orange-600';
  return 'bg-red-600';
};

export default LearningProgress;