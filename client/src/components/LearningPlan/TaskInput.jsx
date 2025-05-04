import React from "react";

const TaskInput = ({ task, index, handleTaskChange, removeTask }) => {
  const handleResourceChange = (resourceIndex, value) => {
    const updatedResources = [...task.resources];
    updatedResources[resourceIndex] = value;
    handleTaskChange(index, { ...task, resources: updatedResources });
  };

  const addResource = () => {
    const updatedResources = [...task.resources, ""];
    handleTaskChange(index, { ...task, resources: updatedResources });
  };

  const removeResource = (resourceIndex) => {
    const updatedResources = task.resources.filter((_, i) => i !== resourceIndex);
    handleTaskChange(index, { ...task, resources: updatedResources });
  };

  const handleDeadlineChange = (e) => {
    const newDeadline = e.target.value;
    console.log(`Task ${index + 1} Deadline:`, newDeadline); // Log the deadline
    handleTaskChange(index, { ...task, deadline: newDeadline });
  };

  const today =  new Date().toISOString().split("T")[0]

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-4 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-gray-800 font-semibold">Task {index + 1}</h4>
        <button
          type="button"
          onClick={() => removeTask(index)}
          className="text-red-600 hover:text-red-700 transition-colors duration-200"
          title="Remove Task"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2">Task Name:</label>
          <input
            type="text"
            value={task.name}
            onChange={(e) => handleTaskChange(index, { ...task, name: e.target.value })}
            className="w-full border border-gray-200 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-gray-700 text-sm font-semibold">Resources:</label>
            <button
              type="button"
              onClick={addResource}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Resource
            </button>
          </div>
          
          <div className="space-y-2">
            {task.resources.map((resource, resourceIndex) => (
              <div key={resourceIndex} className="flex items-center gap-2">
                <input
                  type="text"
                  value={resource}
                  onChange={(e) => handleResourceChange(resourceIndex, e.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                />
                <button
                  type="button"
                  onClick={() => removeResource(resourceIndex)}
                  className="text-red-600 hover:text-red-700 transition-colors duration-200"
                  title="Remove Resource"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2">Deadline:</label>
          <input
            type="date"
            min={today}
            value={task.deadline}
            onChange={handleDeadlineChange}
            className="w-full border border-gray-200 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default TaskInput;