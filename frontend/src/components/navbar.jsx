import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { account } from './../../appwriteConfig';

const Navbar = ({ isAuthenticated, setIsAuthenticated }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (isAuthenticated) {
        try {
          const user = await account.get();
          setCurrentUser(user);
          setIsAdmin(user.email === 'admin@gmail.com');
        } catch (error) {
          console.error('Error fetching user data', error);
        }
      }
    };
    
    fetchCurrentUser();
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      setIsAuthenticated(false);
      setCurrentUser(null);
      setIsAdmin(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  // Don't show navbar on login/signup pages
  if (['/login', '/signup'].includes(location.pathname)) {
    return null;
  }

  return (
    <div className="bg-white text-gray-800 p-4 px-8 max-w-7xl mx-auto shadow-[0px_0px_12px_8px_rgba(0,0,0,0.1)] mt-6 rounded-md">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Fingerprint Voting System</h1>
        {isAuthenticated && (
          <div className="flex space-x-4">
            <Link 
              to="/" 
              className={`px-3 py-2 hover:scale-[1.1] transform transition duration-400 ${location.pathname === '/' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-700'}`}
            >
              Home
            </Link>
            <Link 
              to="/register-voters" 
              className={`px-3 py-2 hover:scale-[1.1] transform transition duration-400 ${location.pathname === '/register-voters' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-700'}`}
            >
              Register Voters
            </Link>
            <Link 
              to="/vote" 
              className={`px-3 py-2 hover:scale-[1.1] transform transition duration-400 ${location.pathname === '/vote' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-700'}`}
            >
              Vote
            </Link>
            {isAdmin && (
              <Link 
                to="/results" 
                className={`px-3 py-2 hover:scale-[1.1] transform transition duration-400 ${location.pathname === '/results' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-700'}`}
              >
                Results
              </Link>
            )}
            <button 
              onClick={handleLogout}
              className="px-3 py-2 text-red-600 hover:text-red-800 hover:scale-[1.1] transform transition duration-400"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;