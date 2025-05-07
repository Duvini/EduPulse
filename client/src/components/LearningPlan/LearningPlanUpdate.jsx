import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TaskInput from './TaskInput';
import { learningPlanService } from '../../services/learningPlanService';
import { useStore } from '../../../store';

const LearningPlanUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const { user } = useStore();

  // Ensure we have a logged-in user
  useEffect(() => {
    if (!user || !user.id) {
      navigate('/signin', { state: { message: 'Please sign in to update a learning plan' } });
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchPlan = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await learningPlanService.getPlanById(id);
        if (response.error) {
          throw new Error(response.error);
        }
        
        // Check response structure - it may be nested
        const planData = response.data?.error === false 
          ? response.data.data 
          : response.data;
        
        if (!planData) {
          throw new Error('Learning plan data not found');
        }
        
        setPlan(planData);
        setTitle(planData.title);
        setDescription(planData.description);
        setTasks(planData.tasks || []);
      } catch (err) {
        console.error('Error fetching plan:', err);
        setError('Failed to fetch learning plan. ' + (err.message || ''));
        if (err.message?.includes('Unauthorized') || err.message?.includes('authentication')) {
          setTimeout(() => navigate('/signin'), 1500);
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPlan();
    }
  }, [id, navigate]);

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
        setSaving(true);
        const response = await learningPlanService.deletePlan(id);
        if (response.error) {
          throw new Error(response.error);
        }
        navigate('/learning-plans', { state: { message: 'Learning plan deleted successfully' } });
      } catch (error) {
        console.error('Error deleting plan:', error);
        setMessage('Failed to delete learning plan: ' + (error.message || ''));
        if (error.message?.includes('Unauthorized') || error.message?.includes('authentication')) {
          setTimeout(() => navigate('/signin'), 1500);
        }
      } finally {
        setSaving(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (title.length < 3 || title.length > 50) {
      setMessage("Title must be between 3 and 50 characters.");
      return;
    }
    if (description.length > 150) {
      setMessage("Description cannot exceed 150 characters.");
      return;
    }
    if (tasks.length === 0) {
      setMessage("At least one task must be added.");
      return;
    }
    
    try {
      setSaving(true);
      setMessage('');
      const updatedPlan = {
        title,
        description,
        tasks,
        creatorId: user?.id || plan?.creatorId || ""
      };
      
      const response = await learningPlanService.updatePlan(id, updatedPlan);
      if (response.error) {
        throw new Error(response.error);
      }
      
      setMessage('Learning plan updated successfully');
      setTimeout(() => {
        navigate('/learning-plans');
      }, 1500);
    } catch (error) {
      console.error('Error updating plan:', error);
      setMessage('Failed to update learning plan: ' + (error.message || ''));
      if (error.message?.includes('Unauthorized') || error.message?.includes('authentication')) {
        setTimeout(() => navigate('/signin'), 1500);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg transform transition-all duration-200 hover:shadow-xl">
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <h2 className="text-dark text-2xl font-bold">Update Learning Plan</h2>
        <button
          onClick={() => navigate('/learning-plans')}
          className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
          disabled={saving}
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

      {error ? (
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
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">Description:</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 min-h-[100px]"
                required
                disabled={saving}
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
                disabled={saving}
              />
            ))}
            <button
              type="button"
              onClick={addTask}
              className={`w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition duration-200 ease-in-out shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
                saving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={saving}
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
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition duration-200 ease-in-out shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              disabled={saving}
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Update Plan
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default LearningPlanUpdate;