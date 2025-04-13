import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RegisterPage = () => {
  const [voters, setVoters] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [showMessage, setShowMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [voterCount, setVoterCount] = useState('');
  const [registerVoters, setRegisterVoters] = useState([]);
  const [showVoterForm, setShowVoterForm] = useState(false);

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

  // Initialize voter forms based on count
  const initializeVoterForms = (count) => {
    if (!count || isNaN(count) || Number(count) <= 0) {
      displayMessage('Please enter a valid number of voters', 'error');
      return;
    }
  
    const newVoters = Array.from({ length: Number(count) }, (_, index) => ({
      id: index.toString(),
      name: '',
      file: null
    }));
  
    setRegisterVoters(newVoters);
    setShowVoterForm(true);
  };

  // Handle voter registration input changes
  const handleRegisterChange = (index, field, value) => {
    const newVoters = [...registerVoters];
    newVoters[index] = { ...newVoters[index], [field]: value };
    setRegisterVoters(newVoters);
  };

  // Handle file selection for registration
  const handleFileChange = (index, e) => {
    const file = e.target.files[0];
    handleRegisterChange(index, 'file', file);
  };

  // Submit voter registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    let validVotersCount = 0;

    registerVoters.forEach((voter, index) => {
      if (voter.name && voter.file) {
        formData.append(`name_${index}`, voter.name);
        formData.append(`fingerprint_${index}`, voter.file);
        validVotersCount++;
      }
    });

    formData.append('voter_count', validVotersCount.toString());

    if (validVotersCount === 0) {
      displayMessage('Please provide at least one voter with name and fingerprint', 'error');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      displayMessage(response.data.message, 'success');
      setLoading(false);
      setShowVoterForm(false); // Reset form after submission
      setVoterCount('');
    } catch (error) {
      displayMessage('Error registering voters: ' + (error.response?.data?.message || error.message), 'error');
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
        <h2 className="text-2xl font-bold mb-6">Register Voters</h2>
        
        {/* Modern Message Popup */}
        <MessagePopup />
        
        {!showVoterForm ? (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">How many voters would you like to register?</h3>
            <div className="flex">
              <input
                type="integer"
                value={voterCount}
                onChange={(e) => setVoterCount(e.target.value)}
                className="w-full md:w-1/3 p-2 border rounded mr-4 outline-none"
                placeholder="Enter number of voters"
                min="1"
                max="100"
              />
              <button
                onClick={() => initializeVoterForms(voterCount)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Continue
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRegisterSubmit}>
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Registering {registerVoters.length} voters</h3>
              <button
                type="button"
                onClick={() => setShowVoterForm(false)}
                className="text-sm text-blue-600 hover:underline"
              >
                Change number of voters
              </button>
            </div>
            
            <div className="mb-6 max-h-96 overflow-y-auto p-2 border rounded">
              {registerVoters.map((voter, index) => (
                <div key={voter.id} className="mb-6 p-4 border rounded">
                  <h3 className="text-lg font-semibold mb-4">Voter {index + 1}</h3>

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={voter.name}
                      onChange={(e) =>
                        handleRegisterChange(index, 'name', e.target.value)
                      }
                      className="w-full p-2 border rounded outline-none"
                      placeholder="Enter voter name"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Fingerprint Image</label>
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(index, e)}
                      className="w-full p-2 border rounded outline-none"
                      accept="image/*"
                    />
                    {voter.file && (
                      <p className="mt-1 text-sm text-gray-500">
                        File selected: {voter.file.name}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register Voters'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;