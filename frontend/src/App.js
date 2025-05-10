import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import "./services/axios-config"; // Import axios config
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import NavBar from "./components/NavBar";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import Progress from "./components/Progress";
import Wall from "./components/Wall";
import WorkoutSchedule from "./pages/WorkoutSchedule"; // Import WorkoutSchedule component
import AuthService from "./services/auth.service";
import UserService from "./services/user.service";

// Home component that redirects based on authentication status
const Home = () => {
  const currentUser = AuthService.getCurrentUser();
  
  if (currentUser) {
    return <Navigate to="/wall" />;
  } else {
    return <Navigate to="/login" />;
  }
};

const App = () => {
  useEffect(() => {
    // Test API connectivity
    UserService.getPublicContent()
      .then(response => {
        console.log("API Test Success:", response.data);
      })
      .catch(error => {
        console.error("API Test Error:", error);
      });
  }, []);

  return (
    <Router>
      <div>
        <NavBar />
        <div className="container-fluid p-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/wall" element={<Wall />} />
            <Route path="/workout-schedule" element={<WorkoutSchedule />} />
          </Routes>
        </div>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
};

export default App;