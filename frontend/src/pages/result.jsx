import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ResultsPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showMessage, setShowMessage] = useState(false);

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

  // Fetch results
  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/results');
      setResults(response.data.results);
      setLoading(false);
    } catch (error) {
      displayMessage('Error fetching results: ' + (error.response?.data?.message || error.message), 'error');
      setLoading(false);
    }
  };

  // Fetch results on component mount
  useEffect(() => {
    fetchResults();
  }, []);

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
      <div className="bg-white rounded-lg shadow-lg p-8 mt-32">
        <h2 className="text-2xl font-bold mb-6">Election Results</h2>
        
        {/* Modern Message Popup */}
        <MessagePopup />
        
        {loading ? (
          <div className="text-center p-8">
            <p className="text-lg">Loading results...</p>
          </div>
        ) : (
          <>
            {results.length === 0 ? (
              <p>No results available.</p>
            ) : (
              <div className="space-y-6">
                {results.map((result, index) => (
                  <div key={index} className="bg-gray-100 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xl font-semibold">{result.candidate}</h3>
                      <span className="text-lg font-bold">{result.vote_count} votes</span>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-4">
                      <div 
                        className="bg-blue-600 h-4 rounded-full" 
                        style={{ 
                          width: `${Math.max(5, (result.vote_count / Math.max(...results.map(r => r.vote_count), 1)) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <button 
              onClick={fetchResults} 
              className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Refresh Results
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;