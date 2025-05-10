import React, { useState, useEffect } from "react";
import TaskInput from "./TaskInput";
import { useNavigate } from "react-router-dom";
import { learningPlanService } from "../../services/learningPlanService";
import { useStore } from "../../../store";

const LearningPlanCreate = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tasks, setTasks] = useState([{ name: "", resources: [], deadline: "", completed: false }]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useStore();

  // Ensure we have a logged-in user
  useEffect(() => {
    if (!user || !user.id) {
      navigate('/signin', { state: { message: 'Please sign in to create a learning plan' } });
    }
  }, [user, navigate]);

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
    setLoading(true);
    setMessage("");

    // Validate title and description
    if (title.length < 3 || title.length > 50) {
      setMessage("Title must be between 3 and 50 characters.");
      setLoading(false);
      return;
    }
    if (description.length > 150) {
      setMessage("Description cannot exceed 150 characters.");
      setLoading(false);
      return;
    }

    // Validate tasks
    if (tasks.length === 0) {
      setMessage("At least one task must be added.");
      setLoading(false);
      return;
    }
    for (const task of tasks) {
      if (!task.name || task.name.length > 50) {
        setMessage("Each task must have a name (max 50 characters).");
        setLoading(false);
        return;
      }
      if (!task.deadline) {
        setMessage("Each task must have a deadline.");
        setLoading(false);
        return;
      }
      if (isNaN(Date.parse(task.deadline))) {
        setMessage("Each task must have a valid deadline in yyyy-MM-dd format.");
        setLoading(false);
        return;
      }
    }

    // Prepare the payload
    const learningPlan = { 
      title, 
      description, 
      tasks,
      creatorId: user?.id || "" // Use user id from store
    };

    console.log("Payload being sent to backend:", learningPlan);

    try {
      const response = await learningPlanService.createPlan(learningPlan);
      if (response.error) {
        setMessage(`Error: ${response.error}`);
        if (response.error.includes("authentication") || response.error.includes("Unauthorized")) {
          // Handle auth errors specifically
          setTimeout(() => navigate('/signin'), 1500);
        }
      } else {
        setMessage("Learning plan created successfully!");
        setTimeout(() => navigate('/learning-plans'), 1500);
      }
    } catch (error) {
      console.error("Error creating learning plan:", error);
      setMessage("Error creating learning plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg transform transition-all duration-200 hover:shadow-xl">
      <h2 className="text-dark text-2xl font-bold mb-6 border-b pb-4">Create Learning Plan</h2>
      {message && (
        <p
          className={`mb-6 p-4 rounded-lg ${
            message.includes("successfully") 
              ? "bg-green-50 text-green-700 border border-green-200" 
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message}
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Description:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 min-h-[100px]"
              required
              disabled={loading}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-dark text-xl font-semibold border-b pb-2">Tasks</h3>
          {tasks.map((task, index) => (
            <TaskInput
              key={index}
              task={task}
              index={index}
              handleTaskChange={handleTaskChange}
              removeTask={removeTask}
              disabled={loading}
            />
          ))}
          <button
            type="button"
            onClick={addTask}
            className={`w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition duration-200 ease-in-out shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Task
          </button>
        </div>
        
        <button
          type="submit"
          className={`w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition duration-200 ease-in-out shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Create Plan
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default LearningPlanCreate;