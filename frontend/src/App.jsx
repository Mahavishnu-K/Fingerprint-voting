import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/navbar';
import HomePage from './pages/home';
import RegisterPage from './pages/register';
import VotePage from './pages/vote';
import ResultsPage from './pages/result';
import LoginPage from './pages/login';
import SignupPage from './pages/signup';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkAuthStatus = async () => {
      try {
        const session = await account.getSession('current');
        if (session) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Not authenticated', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }

    return children;
  };

  return (
    <Router>
      <div className="bg-white">
        <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
        
        <main className="items-center">
          <Routes>
            <Route path="/login" element={
              isAuthenticated ? <Navigate to="/" /> : <LoginPage setIsAuthenticated={setIsAuthenticated} />
            } />
            <Route path="/signup" element={
              isAuthenticated ? <Navigate to="/" /> : <SignupPage setIsAuthenticated={setIsAuthenticated} />
            } />
            <Route path="/" element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } />
            <Route path="/register-voters" element={
              <ProtectedRoute>
                <RegisterPage />
              </ProtectedRoute>
            } />
            <Route path="/vote" element={
              <ProtectedRoute>
                <VotePage />
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