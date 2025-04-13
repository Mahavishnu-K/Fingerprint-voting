import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VotePage = () => {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [showMessage, setShowMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [voterName, setVoterName] = useState('');
  const [voterFingerprint, setVoterFingerprint] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState('');

  // Reset message visibility after timeout
  useEffect(() => {
    let timer;
    if (showMessage) {
      timer = setTimeout(() => {
        setShowMessage(false);
      }, 5000); // Auto hide after 5 seconds
    }
    return () => clearTimeout(timer);
  }, [showMessage]);

  // Display message with type
  const displayMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setShowMessage(true);
  };

  // Submit vote
  const handleVoteSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!voterName || !voterFingerprint || !selectedCandidate) {
      displayMessage('Please fill in all vote details', 'error');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('name', voterName);
    formData.append('fingerprint', voterFingerprint);
    formData.append('candidate', selectedCandidate);

    try {
      const response = await axios.post('http://localhost:5000/api/vote', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      displayMessage(response.data.message, 'success');
      setLoading(false);
      
      // Reset form on successful vote
      setVoterName('');
      setVoterFingerprint(null);
      setSelectedCandidate('');
    } catch (error) {
      displayMessage('Error casting vote: ' + (error.response?.data?.message || error.message), 'error');
      setLoading(false);
    }
  };

  // Message popup component with semi-transparent black background
  const MessagePopup = () => {
    if (!showMessage) return null;
    
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        {/* Semi-transparent black background overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowMessage(false)}></div>
        
        {/* Popup content */}
        <div 
          className={`transform transition-all duration-500 ease-in-out z-10 ${showMessage ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
        >
          <div 
            className={`${
              messageType === 'success' ? 'text-green-400' : 'text-red-400'
            } bg-white px-6 py-4 rounded-lg shadow-lg max-w-md mx-auto flex items-start`}
          >
            <div className="mr-4 mt-1">
              {messageType === 'success' ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">
                {messageType === 'success' ? 'Success' : 'Error'}
              </h3>
              <p>{message}</p>
            </div>
            <button 
              onClick={() => setShowMessage(false)}
              className={`${messageType === 'success' ? 'text-green-400' : 'text-red-400'} ml-auto -mt-1`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-8 mt-40">
        <h2 className="text-2xl font-bold mb-6">Cast Your Vote</h2>
        
        {/* Modern Message Popup */}
        <MessagePopup />
        
        <form onSubmit={handleVoteSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Your Name</label>
            <input
              type="text"
              value={voterName}
              onChange={(e) => setVoterName(e.target.value)}
              className="w-full p-2 border rounded outline-none"
              placeholder="Enter your registered name"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Your Fingerprint Image</label>
            <input
              type="file"
              onChange={(e) => setVoterFingerprint(e.target.files[0])}
              className="w-full p-2 border rounded outline-none"
              accept="image/*"
            />
            {voterFingerprint && <p className="mt-1 text-sm text-gray-500">File selected: {voterFingerprint.name}</p>}
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Select Candidate</label>
            <select
              value={selectedCandidate}
              onChange={(e) => setSelectedCandidate(e.target.value)}
              className="w-full p-2 border rounded outline-none"
            >
              <option value="">Select a candidate</option>
              <option value="Candidate_A">Candidate A</option>
              <option value="Candidate_B">Candidate B</option>
              <option value="Candidate_C">Candidate C</option>
            </select>
          </div>
          
          <button 
            type="submit" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Cast Vote'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VotePage;