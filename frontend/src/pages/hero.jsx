import React from "react";
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  const handleVoterClick = () => {
    navigate('/home');
  };

  const handleAdminClick = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">Fingerprint Voting System</h1>
        <p className="text-center text-gray-600 mb-8">Select your role to continue</p>
        
        <div className="flex flex-col space-y-4">
          <button 
            onClick={handleVoterClick}
            className="py-3 px-4 bg-blue-600 text-white text-lg font-medium rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Voter
          </button>
          
          <button 
            onClick={handleAdminClick}
            className="py-3 px-4 bg-gray-800 text-white text-lg font-medium rounded-md hover:bg-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Admin
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;