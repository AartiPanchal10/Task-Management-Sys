import React, { useEffect, useState } from 'react';
import { Route, useNavigate, Routes, Navigate } from 'react-router-dom';
import './index.css';
import AllTasks from './pages/allTasks.jsx';
import Home from './pages/home.jsx';
import CompletedTasks from './pages/completedTasks.jsx';
import IncompletedTasks from './pages/incompletedTasks.jsx';
import SignUp from './pages/signUp.jsx';
import LogIn from './pages/logIn.jsx';
import MyTasks from './components/home/MyTasks.jsx';
import OtherUserTasks from './components/home/OtherUserTasks.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { authActions } from './store/auth.js';

const App = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  useEffect(() => {
    const checkAuthStatus = async () => {
      if (localStorage.getItem("id") && localStorage.getItem("token")) {
        // Implement a function to verify the token with your backend
        const isValidToken = await verifyToken(localStorage.getItem("token"));
        if (isValidToken) {
          dispatch(authActions.login());
        } else {
          localStorage.removeItem("id");
          localStorage.removeItem("token");
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, [dispatch]);

  if (isLoading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return (
    <div className='bg-slate-500 text-white h-screen p-2 relative'>
      <Routes>
        {/* Public Routes */}
        <Route path='/signUp' element={<SignUp />} />
        <Route path='/logIn' element={<LogIn />} />

        {/* Protected Routes */}
        <Route
          path='/'
          element={isLoggedIn ? <Home /> : <Navigate to="/signUp" replace />}
        >
          {/* My Tasks Routes */}
          <Route path="myTasks" element={<MyTasks />}>
            <Route path="allTasks" element={<AllTasks />} />
            <Route path="completedTasks" element={<CompletedTasks />} />
            <Route path="incompletedTasks" element={<IncompletedTasks />} />
          </Route>

          {/* Other User Tasks Routes */}
          <Route path="otherUserTasks" element={<OtherUserTasks />}>
            <Route path="allTasks" element={<AllTasks />} />
            <Route path="completedTasks" element={<CompletedTasks />} />
            <Route path="incompletedTasks" element={<IncompletedTasks />} />
          </Route>
        </Route>

        {/* Redirect to SignUp if route is not matched */}
        <Route path="*" element={<Navigate to="/signUp" replace />} />
      </Routes>
    </div>
  );
}

// Function to verify token with your backend
const verifyToken = async (token) => {
  try {
    const response = await fetch('http://localhost:3000/api/v1/verify-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.ok;
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
};

export default App;