import React, { useState } from "react";
import axios from "axios";
import TaskInput from "./TaskInput";

const LearningPlanCreate = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tasks, setTasks] = useState([{ name: "", resources: [], deadline: "", completed: false }]);
  const [message, setMessage] = useState("");

  const handleTaskChange = (index, updatedTask) => {
    const updatedTasks = [...tasks];
    updatedTasks[index] = updatedTask;
    setTasks(updatedTasks);
  };

  const addTask = () => {
    setTasks([...tasks, { name: "", resources: [], deadline: "", completed: false }]);
  };

  const removeTask = (index) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate title and description
    if (title.length < 3 || title.length > 50) {
      setMessage("Title must be between 3 and 50 characters.");
      return;
    }
    if (description.length > 150) {
      setMessage("Description cannot exceed 150 characters.");
      return;
    }

    // Validate tasks
    if (tasks.length === 0) {
      setMessage("At least one task must be added.");
      return;
    }
    for (const task of tasks) {
      if (!task.name || task.name.length > 50) {
        setMessage("Each task must have a name (max 50 characters).");
        return;
      }
      if (!task.deadline) {
        setMessage("Each task must have a deadline.");
        return;
      }
      if (isNaN(Date.parse(task.deadline))) {
        setMessage("Each task must have a valid deadline in yyyy-MM-dd format.");
        return;
      }
    }

    // Prepare the payload
    const learningPlan = { creatorId: "user123", title, description, tasks };

    console.log("Payload being sent to backend:", learningPlan);

    try {
      const response = await axios.post("http://localhost:8080/api/v1/plans/create", learningPlan);
      console.log(response);
      setMessage("Learning plan created successfully!");
      setTitle("");
      setDescription("");
      setTasks([{ name: "", resources: [], deadline: "", completed: false }]);
    } catch (error) {
      console.error("Error response from backend:", error.response?.data || error.message);
      setMessage("Error creating learning plan. Please try again.");
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto bg-light p-6 rounded-lg shadow-md">
      <h2 className="text-dark text-2xl font-bold mb-4">Create Learning Plan</h2>
      {message && (
        <p
          className={`mb-4 text-sm ${
            message.includes("successfully") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-muted text-sm mb-1">Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-separator rounded-lg p-2 text-dark focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-muted text-sm mb-1">Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-separator rounded-lg p-2 text-dark focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        <div className="mb-6">
          <h3 className="text-dark text-lg font-semibold mb-2">Tasks</h3>
          {tasks.map((task, index) => (
            <TaskInput
              key={index}
              task={task}
              index={index}
              handleTaskChange={handleTaskChange}
              removeTask={removeTask}
            />
          ))}
          <button
            type="button"
            onClick={addTask}
            className="mt-2 text-light bg-accent px-4 py-2 rounded-lg hover:bg-dark"
          >
            Add Task
          </button>
        </div>
        <button
          type="submit"
          className="w-full bg-primary text-light py-2 rounded-lg hover:bg-dark"
        >
          Create Plan
        </button>
      </form>
    </div>
  );
};

export default LearningPlanCreate;