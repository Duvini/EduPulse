import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home/Home';
import LearningPlanDisplay from '../pages/Home/learningplandisplay'
import LearningPlanCreate from '../components/LearningPlan/LearningPlanCreate';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<div> Root Layout add sign in later </div>} /> 
      <Route path="/feed" element={<Home />} />
      <Route path="/learn" element={<LearningPlanDisplay/>}/>
      <Route path="/create-plan" element={<LearningPlanCreate/>}/>
    </Routes>
  );
};

export default AppRoutes;