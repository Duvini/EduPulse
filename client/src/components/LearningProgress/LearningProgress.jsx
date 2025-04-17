import React from 'react';

const LearningProgress = () => {
  const courses = [
    {
      id: 1,
      title: 'Introduction to Machine Learning',
      progress: 75,
      lastAccessed: '2 days ago',
      image: '/api/placeholder/48/48'
    },
    {
      id: 2,
      title: 'Frontend Development with React',
      progress: 45,
      lastAccessed: 'Yesterday',
      image: '/api/placeholder/48/48'
    },
    {
      id: 3,
      title: 'Data Structures & Algorithms',
      progress: 90,
      lastAccessed: '3 hours ago',
      image: '/api/placeholder/48/48'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-base font-semibold">Learning Progress</h3>
      </div>
      
      <div className="divide-y divide-gray-200">
        {courses.map(course => (
          <div key={course.id} className="px-4 py-3">
            <div className="flex items-start">
              <img src={course.image} alt={course.title} className="w-10 h-10 rounded mr-3 object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{course.title}</p>
                <p className="text-xs text-gray-500 mb-2">Last accessed {course.lastAccessed}</p>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                  <div 
                    className={`h-2 rounded-full ${getProgressColor(course.progress)}`}
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium">{course.progress}% complete</span>
                  <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
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