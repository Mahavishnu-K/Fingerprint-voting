import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { account } from './../../appwriteConfig';
import adminImg from './../assets/admin.png';

const HomePage = () => {
  const [showModal, setShowModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkIfAdmin = async () => {
      try {
        const user = await account.get();
        setIsAdmin(user.email === 'admin@gmail.com');
      } catch (error) {
        console.error('Error checking admin status', error);
      }
    };
    
    checkIfAdmin();
  }, []);

  const handleResultsClick = (e) => {
    if (!isAdmin) {
      e.preventDefault();
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="container mx-auto pl-6 pb-6 pr-6 max-w-4xl relative">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center mt-40">
        <h2 className="text-3xl font-bold mb-6">Welcome to the Fingerprint Voting System</h2>
        <p className="text-lg mb-8">
          This system provides a secure way to vote using fingerprint verification to ensure the integrity of the election process.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-100 p-6 rounded-lg shadow transition-transform duration-300 hover:scale-105">
            <h3 className="text-xl font-semibold mb-4">Step 1: Register</h3>
            <p>Register voters with their names and fingerprint images</p>
            <Link to="/register-voters" className="mt-4 inline-block text-blue-600 transition-transform duration-300 hover:scale-110">
              Go to Registration →
            </Link>
          </div>
          <div className="bg-green-100 p-6 rounded-lg shadow transition-transform duration-300 hover:scale-105">
            <h3 className="text-xl font-semibold mb-4">Step 2: Vote</h3>
            <p>Verify your identity with your fingerprint and cast your vote</p>
            <Link to="/vote" className="mt-4 inline-block text-green-600 transition-transform duration-300 hover:scale-110">
              Go to Voting →
            </Link>
          </div>
          <div className="bg-purple-100 p-6 rounded-lg shadow transition-transform duration-300 hover:scale-105">
            <h3 className="text-xl font-semibold mb-4">Step 3: Results</h3>
            <p>View the election results in real-time</p>
            {isAdmin ? (
              <Link to="/results" className="mt-4 inline-block text-purple-600 transition-transform duration-300 hover:scale-110">
                View Results →
              </Link>
            ) : (
              <button 
                onClick={handleResultsClick} 
                className="mt-4 inline-block text-purple-600 transition-transform duration-300 hover:scale-110"
              >
                View Results →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Admin Access Required Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out">
          <div 
            className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4 animate-[fadeInUp_0.5s_ease-out]"
            style={{
              animation: "fadeInUp 0.3s ease-out forwards"
            }}
          >
            <div className="text-center">
              <div className="mb-4 flex items-center justify-center">
               <img src={adminImg} alt="Admin" style={{width: "70px"}}/>
              </div>
              <h3 className="text-xl font-bold mb-4">Admin Access Required</h3>
              <p className="mb-6">Only administrators can view the election results. Please contact your system administrator if you need access.</p>
              <button
                onClick={closeModal}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;