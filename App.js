import React from 'react';
import MainPage from './MainPage';
import ProfilePage from './ProfilePage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


import './styles/MainPage.css';


function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Router>
    </div>
  );
}


export default App;
