import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminImg from './../assets/admin.png';
import { HiOutlineFingerPrint, HiOutlineShieldCheck, HiOutlineClipboardCheck } from "react-icons/hi";
import { HiOutlineClock } from "react-icons/hi2";

const HomePage = () => {
  const [showModal, setShowModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [electionStatus, setElectionStatus] = useState("Active");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const handleRestrictedClick = (e) => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section with Gradient Background */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-700 rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="px-8 py-10 text-white">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full mb-6">
                  <HiOutlineFingerPrint className="h-16 w-16 text-white" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Fingerprint Voting System</h1>
                <p className="text-xl opacity-90 mb-6">Secure, Transparent, and Efficient</p>
                
                <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <HiOutlineClock className="h-5 w-5 mr-2" />
                  <span>Election Status: </span>
                  <span className="font-semibold ml-1 text-green-300">{electionStatus}</span>
                  <span className="mx-3">|</span>
                  <span>{currentTime.toLocaleDateString()}</span>
                  <span className="mx-1">•</span>
                  <span>{currentTime.toLocaleTimeString()}</span>
                </div>
              </div>
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center">
                  <div className="bg-white/20 p-3 rounded-full mr-3">
                    <HiOutlineShieldCheck className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Secure Voting</p>
                    <h3 className="text-lg font-bold">Fingerprint Verified</h3>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center">
                  <div className="bg-white/20 p-3 rounded-full mr-3">
                    <HiOutlineClipboardCheck className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Process</p>
                    <h3 className="text-lg font-bold">Quick & Easy</h3>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center">
                  <div className="bg-white/20 p-3 rounded-full mr-3">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Privacy</p>
                    <h3 className="text-lg font-bold">100% Anonymous</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Info Card */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8 border-l-4 border-blue-500">
            <div className="flex items-start">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Important Information</h3>
                <div className="mt-2 text-gray-600">
                  <p>Welcome to the official Fingerprint Voting System. To cast your vote, you'll need to verify your identity using your fingerprint at the voting station.</p>
                  <p className="mt-2">Please have your voter ID card ready when you arrive at the polling booth. If you haven't registered yet, please contact an election official.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div 
              onClick={handleRestrictedClick} 
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 border-l-4 border-gray-300 flex items-center cursor-pointer opacity-75"
            >
              <div className="bg-gray-100 p-3 rounded-full mr-4">
                <svg className="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Registration</h3>
                <p className="text-gray-600 text-sm">Admin access required</p>
              </div>
            </div>
            
            <Link to="/vote" className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 border-l-4 border-green-500 flex items-center transform hover:scale-105 hover:bg-green-50">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Cast Your Vote</h3>
                <p className="text-gray-600 text-sm">Verify and vote now</p>
              </div>
            </Link>
            
            <div 
              onClick={handleRestrictedClick}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 border-l-4 border-gray-300 flex items-center cursor-pointer opacity-75"
            >
              <div className="bg-gray-100 p-3 rounded-full mr-4">
                <svg className="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Results</h3>
                <p className="text-gray-600 text-sm">Admin access required</p>
              </div>
            </div>
          </div>
          
          {/* Voting Process Steps */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">How to Vote</h3>
            </div>
            <div className="p-6">
              <div className="flex flex-col space-y-6">
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-semibold mr-4 flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-800">Verify Your Identity</h4>
                    <p className="text-gray-600 mt-1">Place your registered finger on the scanner for identity verification.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-semibold mr-4 flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-800">Review Candidates</h4>
                    <p className="text-gray-600 mt-1">Once verified, you'll see the list of candidates for your constituency.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-semibold mr-4 flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-800">Make Your Selection</h4>
                    <p className="text-gray-600 mt-1">Select your preferred candidate or party by clicking on their name/symbol.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-semibold mr-4 flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-800">Confirm Your Vote</h4>
                    <p className="text-gray-600 mt-1">Review your selection and confirm your vote. You'll receive a confirmation once your vote is recorded.</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-center">
                <Link
                  to="/vote"
                  className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-sm hover:shadow-md"
                >
                  <HiOutlineFingerPrint className="mr-2 h-5 w-5" />
                  Proceed to Voting
                </Link>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-6 text-gray-500 text-sm">
            <p>© 2025 Election Commission. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Admin Access Required Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div 
            className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4"
            style={{
              animation: "fadeInUp 0.3s ease-out forwards"
            }}
          >
            <div className="text-center">
              <div className="mb-4 flex items-center justify-center">
                <img src={adminImg} alt="Admin" style={{width: "70px"}} className="rounded-full border-4 border-gray-100 shadow-md" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Admin Access Required</h3>
              <p className="mb-6 text-gray-600">Only administrators can register voters and view the election results. Please contact your system administrator if you need access.</p>
              <button
                onClick={closeModal}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
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