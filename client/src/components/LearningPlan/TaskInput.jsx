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

  return (
    <div className="bg-light border border-separator rounded-lg p-4 mb-4 shadow-sm">
      <h4 className="text-dark font-semibold mb-2">Task {index + 1}</h4>
      <div className="mb-3">
        <label className="block text-muted text-sm mb-1">Name:</label>
        <input
          type="text"
          value={task.name}
          onChange={(e) => handleTaskChange(index, { ...task, name: e.target.value })}
          className="w-full border border-separator rounded-lg p-2 text-dark focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>
      <div className="mb-3">
        <label className="block text-muted text-sm mb-1">Resources:</label>
        {task.resources.map((resource, resourceIndex) => (
          <div key={resourceIndex} className="flex items-center mb-2">
            <input
              type="text"
              value={resource}
              onChange={(e) => handleResourceChange(resourceIndex, e.target.value)}
              className="w-full border border-separator rounded-lg p-2 text-dark focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => removeResource(resourceIndex)}
              className="ml-2 text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addResource}
          className="mt-2 text-light bg-accent px-4 py-2 rounded-lg hover:bg-dark"
        >
          Add Resource
        </button>
      </div>
      <div className="mb-3">
        <label className="block text-muted text-sm mb-1">Deadline:</label>
        <input
          type="date"
          value={task.deadline}
          onChange={handleDeadlineChange}
          className="w-full border border-separator rounded-lg p-2 text-dark focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>
      <button
        type="button"
        onClick={() => removeTask(index)}
        className="text-accent text-sm underline hover:text-dark"
      >
        Remove Task
      </button>
    </div>
  );
};

export default TaskInput;