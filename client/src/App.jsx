import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from './components/Sidebar/sidebar';
import AppRoutes from './routes/routes';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Sidebar />
        <div className="main-content">
          <AppRoutes />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;