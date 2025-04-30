import React, { useState, useEffect } from 'react';
import { LuRefreshCcw } from "react-icons/lu";
import { BsInfoCircle } from "react-icons/bs";
import axios from 'axios';

const ResultsPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  const candidates = [
    { name: 'Thalapathy Vijay', party: 'Tamilaga Vettri Kazhagam' },
    { name: 'Stalin', party: 'DMK' },
    { name: 'Seeman', party: 'NTK' },
    { name: 'Annamala', party: 'BJP' }
  ];
  

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
      const resultsData = Array.isArray(response.data) ? response.data : 
                          (response.data.results ? response.data.results : []);
      
      const enrichedResults = resultsData.map(result => {
        const candidateInfo = candidates.find(c => c.party === result.candidate);
        return {
          ...result,
          name: candidateInfo?.name || 'Unknown',
        };
      });

      console.log(enrichedResults);
      setResults(enrichedResults);
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

  // Calculate total votes
  const totalVotes = results.reduce((sum, result) => sum + result.vote_count, 0);

  // Calculate percentage for each candidate
  const calculatePercentage = (voteCount) => {
    if (totalVotes === 0) return 0;
    return ((voteCount / totalVotes) * 100).toFixed(1);
  };

  // Get party color
  const getPartyColor = (candidate) => {
    const name = candidate.toLowerCase();
    if (name.includes('tamilaga')) return 'bg-blue-600';
    if (name.includes('dmk')) return 'bg-red-600';
    if (name.includes('ntk')) return 'bg-green-600';
    if (name.includes('bjp')) return 'bg-yellow-600';
    return 'bg-purple-600'; // Default color
  };

  // Message popup component with semi-transparent black background
  const MessagePopup = () => {
    if (!showMessage) return null;
    
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm" onClick={() => setShowMessage(false)}></div>
        
        <div className={`transform transition-all duration-300 ease-in-out z-10 ${showMessage ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
          <div className={`${
            messageType === 'success' ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
          } bg-white px-6 py-5 rounded-lg shadow-xl max-w-md mx-auto flex items-start`}>
            <div className="mr-4 mt-1">
              {messageType === 'success' ? (
                <div className="bg-green-100 p-2 rounded-full">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              ) : (
                <div className="bg-red-100 p-2 rounded-full">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1 text-gray-800">
                {messageType === 'success' ? 'Success' : 'Error'}
              </h3>
              <p className="text-gray-600">{message}</p>
            </div>
            <button 
              onClick={() => setShowMessage(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
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
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Modern Message Popup */}
          <MessagePopup />
          
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-700 text-white p-6">
              <h1 className="text-3xl font-bold">Election Results</h1>
              <p className="mt-2 opacity-90">Live results from the current election</p>
            </div>
            
            <div className="p-8">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-lg text-gray-600">Loading election results...</p>
                </div>
              ) : (
                <>
                  {results.length === 0 ? (
                    <div className="text-center py-8">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      <p className="text-xl text-gray-500">No results available at this time.</p>
                      <p className="text-gray-400 mt-2">Please check back later.</p>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">Total Votes Cast</h2>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-2xl font-bold text-blue-800">{totalVotes.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <h2 className="text-xl font-semibold text-gray-700 mb-4">Candidate Results</h2>
                      <div className="space-y-6">
                        {results
                          .sort((a, b) => b.vote_count - a.vote_count)
                          .map((result, index) => (
                            <div key={index} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition duration-200">
                              <div className="flex justify-between items-center mb-3">
                                <div>
                                  <h3 className="text-xl font-semibold text-gray-800">{result.candidate}</h3>
                                  <p className="text-sm text-gray-500">
                                    {result.name || "Party information unavailable"}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span className="text-lg font-bold text-gray-800">{result.vote_count.toLocaleString()}</span>
                                  <p className="text-sm text-gray-500">
                                    {calculatePercentage(result.vote_count)}% of votes
                                  </p>
                                </div>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                                <div 
                                  className={`${getPartyColor(result.candidate || '')} h-4 rounded-full`} 
                                  style={{ 
                                    width: `${Math.max(1, calculatePercentage(result.vote_count))}%` 
                                  }}
                                ></div>
                              </div>
                            </div>
                          ))}
                      </div>
                      
                      <div className="mt-10">
                        <div className="text-m text-gray-500 mb-4 flex items-center">
                          <BsInfoCircle style={{marginRight:'6px'}} />
                          Last updated: {new Date().toLocaleString()}
                        </div>
                        
                        <button 
                          onClick={fetchResults} 
                          className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        >
                          <LuRefreshCcw style={{marginRight:'10px'}} size={22}/>
                          Refresh Results
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;