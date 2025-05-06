import React, { useState, useEffect } from "react";
import LearnPlanMain from "../components/LearningPlan/LearnPlanMain";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LearningPlanDisplay = () => {
  const [learningPlans, setLearningPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchLearningPlans = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/v1/plans");
      if (response.data.error === false) {
        // If it's a single plan, wrap it in an array
        const plans = Array.isArray(response.data.data) 
          ? response.data.data 
          : [response.data.data];
        setLearningPlans(plans);
      } else {
        setError("No learning plans found");
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError("Failed to fetch learning plans");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLearningPlans();
  }, []);

  const handleCreatePlan = () => {
    navigate('/create-plan');
  };

  const handleDeletePlan = (planId) => {
    setLearningPlans(prevPlans => prevPlans.filter(plan => plan.id !== planId));
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-xl text-gray-600">Loading...</div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-xl text-red-600">{error}</div>
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
      
      {learningPlans.length === 0 ? (
        <div className="text-center py-8">
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