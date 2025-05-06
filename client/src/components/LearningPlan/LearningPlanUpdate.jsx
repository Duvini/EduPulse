import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import TaskInput from './TaskInput';

const LearningPlanUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/v1/plans/${id}`);
        if (response.data.error === false) {
          const planData = response.data.data;
          setPlan(planData);
          setTitle(planData.title);
          setDescription(planData.description);
          setTasks(planData.tasks);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching plan:', err);
        setError('Failed to fetch learning plan');
        setLoading(false);
      }
    };

    fetchPlan();
  }, [id]);

  const handleTaskChange = (index, updatedTask) => {
    const updatedTasks = [...tasks];
    updatedTasks[index] = updatedTask;
    setTasks(updatedTasks);
  };

  const addTask = () => {
    setTasks([...tasks, { name: '', resources: [], deadline: '', completed: false }]);
  };

  const removeTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this learning plan? This action cannot be undone.')) {
      try {
        await axios.delete(`http://localhost:8080/api/v1/plans/delete/${id}`);
        navigate('/learning-plans', { state: { message: 'Learning plan deleted successfully' } });
      } catch (error) {
        console.error('Error deleting plan:', error);
        setMessage('Failed to delete learning plan');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.patch(`http://localhost:8080/api/v1/plans/update/${id}`, {
        title,
        description,
        tasks
      });
      if (response.data.error === false) {
        setMessage('Learning plan updated successfully');
        setTimeout(() => {
          navigate('/learning-plans');
        }, 1500);
      } else {
        setMessage('Failed to update learning plan');
      }
    } catch (error) {
      console.error('Error updating plan:', error);
      setMessage('Failed to update learning plan');
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg transform transition-all duration-200 hover:shadow-xl">
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <h2 className="text-dark text-2xl font-bold">Update Learning Plan</h2>
        <button
          onClick={() => navigate('/learning-plans')}
          className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

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

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center p-6 bg-red-50 rounded-lg">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => navigate('/learning-plans')}
            className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
          >
            Return to Learning Plans
          </button>
        </div>
      ) : (
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
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">Description:</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 min-h-[100px]"
                required
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
              />
            ))}
            <button
              type="button"
              onClick={addTask}
              className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition duration-200 ease-in-out shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Task
            </button>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition duration-200 ease-in-out shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Update Plan
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition duration-200 ease-in-out shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Delete Plan
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default LearningPlanUpdate;