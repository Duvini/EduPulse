import React, { useState, useEffect } from 'react';
import { learningProgressService } from '../../services/learningProgressService';

const LearningProgress = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLearningProgress();
  }, []);

  const fetchLearningProgress = async () => {
    setLoading(true);
    const { data, error } = await learningProgressService.getUserProgress();
    if (error) {
      setError(error);
    } else {
      setCourses(data.data || []);
    }
    setLoading(false);
  };

  const handleTaskStatusUpdate = async (planId, taskIndex, isCompleted) => {
    const { error } = await learningProgressService.updateTaskStatus(planId, taskIndex, isCompleted);
    if (!error) {
      fetchLearningProgress(); // Refresh data after update
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <p className="text-red-500">Error loading learning progress</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-base font-semibold">Learning Progress</h3>
      </div>
      
      <div className="divide-y divide-gray-200">
        {courses.map(course => (
          <div key={course.id} className="px-4 py-3">
            <div className="flex items-start">
              <img 
                src={course.image || '/api/placeholder/48/48'} 
                alt={course.title} 
                className="w-10 h-10 rounded mr-3 object-cover" 
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{course.title}</p>
                <p className="text-xs text-gray-500 mb-2">
                  Last accessed {course.lastAccessed || 'recently'}
                </p>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                  <div 
                    className={`h-2 rounded-full ${getProgressColor(course.progress)}`}
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium">{course.progress}% complete</span>
                  <button 
                    onClick={() => handleTaskStatusUpdate(course.id, course.currentTaskIndex, true)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="px-4 py-3 text-center border-t border-gray-200">
        <button className="text-sm text-blue-600 font-medium hover:text-blue-800">
          View all courses
        </button>
      </div>
    </div>
  );
};

const getProgressColor = (progress) => {
  if (progress < 30) return 'bg-red-500';
  if (progress < 70) return 'bg-yellow-500';
  return 'bg-green-500';
};

export default LearningProgress;