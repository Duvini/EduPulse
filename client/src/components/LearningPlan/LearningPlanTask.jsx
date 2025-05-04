import React from "react";

const LearnPlanTask = ({ task, onStatusChange, loading }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={`bg-gray-50 rounded-lg p-4 transition-all duration-200 ${task.completed ? 'border-l-4 border-green-500' : 'border-l-4 border-yellow-500'}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center">
            <div 
              className={`w-4 h-4 rounded-full border-2 mr-3 cursor-pointer transition-colors duration-200 ${
                task.completed 
                  ? 'bg-green-500 border-green-500' 
                  : 'border-yellow-500 hover:border-yellow-600'
              }`}
              onClick={() => !loading && onStatusChange(!task.completed)}
            >
              {task.completed && (
                <svg className="text-white" viewBox="0 0 16 16">
                  <path fill="currentColor" d="M5.707 7.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4a1 1 0 0 0-1.414-1.414L7 8.586 5.707 7.293z"/>
                </svg>
              )}
            </div>
            <h4 className={`text-lg font-semibold ${task.completed ? 'text-gray-600 line-through' : 'text-gray-800'}`}>
              {task.name}
            </h4>
          </div>
        </div>
        <button
          onClick={() => !loading && onStatusChange(!task.completed)}
          disabled={loading}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition duration-200 ${
            loading 
              ? 'bg-gray-300 cursor-not-allowed' 
              : task.completed 
                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
          }`}
        >
          {loading ? (
            <div className="flex items-center">
              <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Updating...
            </div>
          ) : task.completed ? 'Completed' : 'Mark Complete'}
        </button>
      </div>
      
      <div className="mt-4 space-y-2 pl-7">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Deadline:</span> {formatDate(task.deadline)}
        </p>
        {task.resources.length > 0 && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Resources:</span>
            <ul className="list-disc ml-5 mt-1">
              {task.resources.map((resource, index) => (
                <li key={index}>
                  <a 
                    href={resource}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {resource}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex items-center">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            task.completed 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {task.completed ? "Completed" : "In Progress"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LearnPlanTask;