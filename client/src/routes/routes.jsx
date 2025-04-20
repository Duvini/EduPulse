import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home/Home';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<div> Root Layout add sign in later </div>} /> 
      <Route path="/feed" element={<Home />} />
    </Routes>
  );
};

export default AppRoutes;