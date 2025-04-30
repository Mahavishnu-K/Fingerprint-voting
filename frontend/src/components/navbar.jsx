import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { account } from '../../appwriteConfig';
import { HiOutlineFingerPrint, HiOutlineUserAdd, HiOutlineChartBar } from "react-icons/hi";
import { LuLogOut } from "react-icons/lu";
import { HiOutlineHome, HiOutlineArrowRightOnRectangle } from "react-icons/hi2";

const Navbar = ({ isAuthenticated }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  useEffect(() => {
    setIsAdmin(isAuthenticated);
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      setIsAdmin(false);
      navigate('/');
      window.dispatchEvent(new Event('auth-state-changed'));
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const handleVoterExit = () => {
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (['/login','/'].includes(location.pathname)) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-indigo-700 text-white p-4 shadow-2xl mb-8">
      <div className="container mx-auto">
        {/* Desktop Navbar */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">Fingerprint Voting System</h1>
          </div>
          
          <div className="flex space-x-1">
            {isAdmin ? (
              <Link 
                to="/admin-dashboard"
                className={`px-4 py-2 rounded-lg flex items-center transition-all duration-200 
                  ${location.pathname === '/admin-dashboard' 
                    ? 'bg-white/20 backdrop-blur-sm font-semibold' 
                    : 'hover:bg-white/10'}`}
              >
                <HiOutlineHome className="mr-2 h-5 w-5"/>
                Dashboard
              </Link>
            ) : (
              <Link 
                to="/home"
                className={`px-4 py-2 rounded-lg flex items-center transition-all duration-200 
                  ${location.pathname === '/home' 
                    ? 'bg-white/20 backdrop-blur-sm font-semibold' 
                    : 'hover:bg-white/10'}`}
              >
                <HiOutlineHome className="mr-2 h-5 w-5" />
                Home
              </Link>
            )}
            
            {isAdmin && (
              <Link 
                to="/register-voters" 
                className={`px-4 py-2 rounded-lg flex items-center transition-all duration-200 
                  ${location.pathname === '/register-voters' 
                    ? 'bg-white/20 backdrop-blur-sm font-semibold' 
                    : 'hover:bg-white/10'}`}
              >
                <HiOutlineUserAdd className="mr-2 h-5 w-5" />
                Register Voters
              </Link>    
            )}
            
            <Link 
              to="/vote" 
              className={`px-4 py-2 rounded-lg flex items-center transition-all duration-200 
                ${location.pathname === '/vote' 
                  ? 'bg-white/20 backdrop-blur-sm font-semibold' 
                  : 'hover:bg-white/10'}`}
            >
              <HiOutlineFingerPrint className="mr-2 h-5 w-5" />
              Vote
            </Link>
            
            {isAdmin && (
              <Link 
                to="/results" 
                className={`px-4 py-2 rounded-lg flex items-center transition-all duration-200 
                  ${location.pathname === '/results' 
                    ? 'bg-white/20 backdrop-blur-sm font-semibold' 
                    : 'hover:bg-white/10'}`}
              >
                <HiOutlineChartBar className="mr-2 h-5 w-5" />
                Results
              </Link>
            )}
            
            {isAdmin ? (
              <button 
                onClick={handleLogout}
                className="ml-2 px-3 py-2 bg-white border-none font-semibold text-blue-700 rounded-lg flex items-center transition-all duration-200"
              >
                <LuLogOut className="mr-2 h-4 w-4" />
                Logout
              </button>
            ) : (
              <button 
                onClick={handleVoterExit}
                className="ml-2 px-4 py-2 bg-white border-none font-semibold text-blue-700 rounded-lg flex items-center transition-all duration-200"
              >
                <LuLogOut className="mr-2 h-4 w-4" />
                Exit
              </button>
            )}
          </div>
        </div>
        
        {/* Mobile Navbar */}
        <div className="md:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <HiOutlineFingerPrint className="h-7 w-7 mr-2" />
              <h1 className="text-xl font-bold">FP Voting System</h1>
            </div>
            
            <button 
              onClick={toggleMenu}
              className="text-white focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                {isMenuOpen 
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                }
              </svg>
            </button>
          </div>
          
          {isMenuOpen && (
            <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-2 animate-fadeIn">
              {isAdmin ? (
                <Link 
                  to="/admin-dashboard"
                  className={`block px-4 py-2 rounded-md ${location.pathname === '/admin-dashboard' ? 'bg-white/20 font-semibold' : 'hover:bg-white/10'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <HiOutlineHome className="mr-2 h-5 w-5" />
                    Dashboard
                  </div>
                </Link>
              ) : (
                <Link 
                  to="/home"
                  className={`block px-4 py-2 rounded-md ${location.pathname === '/home' ? 'bg-white/20 font-semibold' : 'hover:bg-white/10'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <HiOutlineHome className="mr-2 h-5 w-5" />
                    Home
                  </div>
                </Link>
              )}
              
              {isAdmin && (
                <Link 
                  to="/register-voters" 
                  className={`block px-4 py-2 rounded-md ${location.pathname === '/register-voters' ? 'bg-white/20 font-semibold' : 'hover:bg-white/10'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <HiOutlineUserAdd className="mr-2 h-5 w-5" />
                    Register Voters
                  </div>
                </Link>    
              )}
              
              <Link 
                to="/vote" 
                className={`block px-4 py-2 rounded-md ${location.pathname === '/vote' ? 'bg-white/20 font-semibold' : 'hover:bg-white/10'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <HiOutlineFingerPrint className="mr-2 h-5 w-5" />
                  Vote
                </div>
              </Link>
              
              {isAdmin && (
                <Link 
                  to="/results" 
                  className={`block px-4 py-2 rounded-md ${location.pathname === '/results' ? 'bg-white/20 font-semibold' : 'hover:bg-white/10'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <HiOutlineChartBar className="mr-2 h-5 w-5" />
                    Results
                  </div>
                </Link>
              )}
              
              <div className="mt-3 pt-3 border-t border-white/20">
                {isAdmin ? (
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md flex items-center justify-center"
                  >
                    <HiOutlineArrowRightOnRectangle className="mr-2 h-5 w-5" />
                    Logout
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      handleVoterExit();
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md flex items-center justify-center"
                  >
                    <HiOutlineArrowRightOnRectangle className="mr-2 h-5 w-5" />
                    Exit
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Navbar;