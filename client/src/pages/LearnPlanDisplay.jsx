import React, { useState, useEffect } from "react";
import LearnPlanMain from "../components/LearningPlan/LearnPlanMain";
import { learningPlanService } from "../services/learningPlanService";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../store";

const LearningPlanDisplay = () => {
  const [learningPlans, setLearningPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useStore();

  const fetchLearningPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // If user is logged in, get their specific plans
      const response = user && user.id
        ? await learningPlanService.getUserPlans(user.id)
        : await learningPlanService.getAllPlans();
      
      if (!response.error && response.data?.error === false) {
        // If it's a single plan, wrap it in an array
        const planData = response.data.data;
        const plans = Array.isArray(planData) ? planData : [planData];
        setLearningPlans(plans);
      } else {
        setError("Unable to load learning plans");
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError("Failed to fetch learning plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLearningPlans();
  }, [user]);

  const handleCreatePlan = () => {
    navigate('/create-plan');
  };

  const handleDeletePlan = (planId) => {
    setLearningPlans(prevPlans => prevPlans.filter(plan => plan.id !== planId));
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Learning Plans</h1>
        <button
          onClick={handleCreatePlan}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 ease-in-out shadow-md"
        >
          Create New Plan
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {learningPlans.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-gray-600 text-lg">No learning plans found. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {learningPlans.map((plan) => (
            <LearnPlanMain 
              key={plan.id} 
              plan={plan}
              onUpdate={fetchLearningPlans}
              onDelete={handleDeletePlan}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LearningPlanDisplay;