import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { account } from '../appwriteConfig';
import Navbar from './components/navbar';
import HomePage from './pages/home';
import RegisterPage from './pages/register';
import VotePage from './pages/vote';
import ResultsPage from './pages/result';
import LoginPage from './pages/login';
import Hero from './pages/hero';
import AdminDashboard from './pages/adminDashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      const session = await account.get();
      if (session) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Not authenticated', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
    
    const handleAuthChange = () => {
      checkAuthStatus();
    };
    
    window.addEventListener('auth-state-changed', handleAuthChange);
    
    return () => {
      window.removeEventListener('auth-state-changed', handleAuthChange);
    };
  }, []);

  const updateAuthState = (value) => {
    setIsAuthenticated(value);
    window.dispatchEvent(new Event('auth-state-changed'));
  };

  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-lg text-gray-600">Loading ...</p>
          </div>
        </div>
      );
    }
    
    if (!isAuthenticated) {
      return <Navigate to="/" />;
    }

    return children;
  };

  return (
    <Router>
      <div className="bg-white">
        <Navbar isAuthenticated={isAuthenticated}/>
        
        <main className="items-center">
          <Routes>
            <Route path="/" element={<Hero />} />
            <Route path="/login" element={<LoginPage setIsAuthenticated={updateAuthState}/>} />
           
            <Route path="/home" element={<HomePage />} />
            <Route path="/vote" element={<VotePage />} />

            <Route path="/admin-dashboard" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/register-voters" element={
              <ProtectedRoute>
                <RegisterPage />
              </ProtectedRoute>
            } />
            <Route path="/results" element={
              <ProtectedRoute>
                <ResultsPage />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        
      </div>
    </Router>
  );
}

export default App;