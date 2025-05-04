import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home/Home';
import LearningPlanCreate from '../components/LearningPlan/LearningPlanCreate';
import LearningPlanUpdate from '../components/LearningPlan/LearningPlanUpdate';
import LearnPlanDisplay from '../pages/LearnPlanDisplay';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/learning-plans" element={<LearnPlanDisplay />} />
      <Route path="/create-plan" element={<LearningPlanCreate />} />
      <Route path="/update-plan/:id" element={<LearningPlanUpdate />} />
    </Routes>
  );
};

export default AppRoutes;