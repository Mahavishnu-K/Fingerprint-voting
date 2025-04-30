import React, { useState, useEffect } from 'react';
import { databases, storage, DATABASE_ID, COLLECTION_ID, STORAGE_BUCKET_ID, Query } from '../../appwriteConfig';
import { TbHandFinger } from "react-icons/tb";
import axios from 'axios';

const VotePage = () => {
  // States for form and UI
  const [voterId, setVoterId] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [voterData, setVoterData] = useState(null);
  const [voterIdImageUrl, setVoterIdImageUrl] = useState(null);
  const [voterFingerprint, setVoterFingerprint] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [showVoterDetails, setShowVoterDetails] = useState(false);
  const [showVotingForm, setShowVotingForm] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  // Candidates list
  const candidates = [
    { id: 'candidate1', name: 'Thalapathy Vijay', party: 'Tamilaga Vettri Kazhagam' },
    { id: 'candidate2', name: 'Stalin', party: 'DMK' },
    { id: 'candidate3', name: 'Seeman', party: 'NTK' },
    { id: 'candidate4', name: 'Annamalai', party: 'BJP' }
  ];

  // Reset message visibility after timeout
  useEffect(() => {
    let timer;
    if (showMessage) {
      timer = setTimeout(() => {
        setShowMessage(false);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [showMessage]);

  // Display message with type
  const displayMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setShowMessage(true);
  };

  // Helper function to extract voter ID image from Appwrite
  const getVoterIdImage = async (fileId) => {
    try {
      const imageUrl = storage.getFileView(STORAGE_BUCKET_ID, fileId);
      return imageUrl;
    } catch (error) {
      console.error("Error getting voter ID image:", error);
      return null;
    }
  };

  // Verify and fetch voter data
  const verifyVoter = async (e) => {
    e.preventDefault();
    
    if (!voterId) {
      displayMessage('Please enter your User ID', 'error');
      return;
    }

    setVerifying(true);
    setVerified(false);
    setVoterData(null);
    setVoterIdImageUrl(null);

    try {
      // Query the database for the voter
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [
          Query.equal('userId', voterId)
        ]
      );

      if (response.documents.length === 0) {
        displayMessage('Voter not found. Please check your User ID', 'error');
        setVerifying(false);
        return;
      }

      const voter = response.documents[0];
      setVoterData(voter);

      // Get voter ID image
      if (voter.voteridFileID) {
        const imageUrl = await getVoterIdImage(voter.voteridFileID);
        setVoterIdImageUrl(imageUrl);
      }

      setVerifying(false);
      setVerified(true);
      setShowVoterDetails(true);
    } catch (error) {
      displayMessage('Error verifying voter: ' + error.message, 'error');
      setVerifying(false);
    }
  };

  // Handle fingerprint file selection
  const handleFingerprintChange = (e) => {
    setVoterFingerprint(e.target.files[0]);
  };

  // Proceed to voting after verification
  const proceedToVoting = () => {
    setShowVoterDetails(false);
    setShowVotingForm(true);
  };

  // Submit vote
  const handleVoteSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!voterData || !voterFingerprint || !selectedCandidate) {
      displayMessage('Please select a candidate and provide your fingerprint', 'error');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('name', voterData.name);
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
      
      // Reset form and show success
      setVoteSuccess(true);
      setShowVotingForm(false);
      setVoterFingerprint(null);
      setSelectedCandidate('');
    } catch (error) {
      displayMessage('Error casting vote: ' + (error.response?.data?.message || error.message), 'error');
      setLoading(false);
    }
  };

  // Reset the entire voting process
  const resetVoting = () => {
    setVoterId('');
    setVerified(false);
    setVoterData(null);
    setVoterIdImageUrl(null);
    setVoterFingerprint(null);
    setSelectedCandidate('');
    setShowVoterDetails(false);
    setShowVotingForm(false);
    setVoteSuccess(false);
  };

  // Message popup component
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

  // Voter details popup
  // Full image popup component
  const FullImagePopup = () => {
    if (!showFullImage || !voterIdImageUrl) return null;
    
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowFullImage(false)}></div>
        <div className="relative z-50 max-w-4xl w-full h-full flex items-center justify-center p-4">
          <button 
            className="absolute top-6 right-6 text-white hover:text-gray-300 z-50"
            onClick={() => setShowFullImage(false)}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          <img 
            src={voterIdImageUrl} 
            alt="Voter ID Full View" 
            className="max-w-full max-h-full object-contain"
          />
        </div>
      </div>
    );
  };

  const VoterDetailsPopup = () => {
    if (!showVoterDetails || !voterData) return null;
    
    return (
      <div className="fixed inset-0 flex items-center justify-center z-40">
        <div className="absolute inset-0 bg-black bg-opacity-70" onClick={() => setShowVoterDetails(false)}></div>
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full z-50 relative">
          <button 
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            onClick={() => setShowVoterDetails(false)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          
          <h3 className="text-2xl font-bold text-blue-800 mb-6">Voter Verification</h3>
          
          <div className="grid grid-cols-1 gap-4 mb-6">
            <div className="flex flex-col">
              <label className="text-sm text-gray-600">Name</label>
              <p className="font-semibold text-gray-800">{voterData.name}</p>
            </div>
            
            <div className="flex flex-col">
              <label className="text-sm text-gray-600">Age</label>
              <p className="font-semibold text-gray-800">{voterData.age}</p>
            </div>
            
            <div className="flex flex-col">
              <label className="text-sm text-gray-600">Date of Birth</label>
              <p className="font-semibold text-gray-800">
                {voterData.dob.replace(/-/g, '/')}
              </p>
            </div>
            
            <div className="flex flex-col">
              <label className="text-sm text-gray-600">Address</label>
              <p className="font-semibold text-gray-800">{voterData.address}</p>
            </div>
            
            {voterIdImageUrl && (
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Voter ID Image</label>
                <div className="relative">
                  <img 
                    src={voterIdImageUrl} 
                    alt="Voter ID" 
                    className="w-full h-40 object-contain border rounded cursor-pointer hover:opacity-90 transition"
                    onClick={() => setShowFullImage(true)}
                  />
                  <div 
                    className="absolute bottom-2 right-2 bg-gray-800 bg-opacity-70 text-white p-1 rounded-full cursor-pointer hover:bg-opacity-90"
                    onClick={() => setShowFullImage(true)}
                  >
                    <TbHandFinger />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-center gap-20">
            <button
              onClick={() => setShowVoterDetails(false)}
              className="mr-2 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={proceedToVoting}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Confirm to Vote
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Message Popup */}
        <MessagePopup />
        
        {/* Voter Details Popup */}
        <VoterDetailsPopup />
        
        {/* Full Image Popup */}
        <FullImagePopup />
        
        <div className="max-w-4xl mx-auto">
          {!voteSuccess ? (
            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-700 text-white p-6">
                <h1 className="text-3xl font-bold">Secure Voting Portal</h1>
                <p className="mt-2 opacity-90">Cast your vote securely using biometric verification</p>
              </div>
              
              {!showVotingForm ? (
                /* User ID Verification Form */
                <div className="p-8">
                  <h2 className="text-2xl font-semibold mb-6">Voter Verification</h2>
                  
                  <form onSubmit={verifyVoter} className="space-y-6">
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">Enter your Voter ID</label>
                      <input
                        type="text"
                        value={voterId}
                        onChange={(e) => setVoterId(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="e.g. ERF2576477"
                        disabled={verifying}
                      />
                      <p className="text-sm text-gray-500 mt-5">
                        <span className="text-blue-600 font-medium">Need a help?</span> <br />Your Voter ID is your unique identification code as per Election commission provided Elector ID card.
                        <br />You can find it above or below your photo in Elector ID card.
                      </p>
                    </div>
                    
                    <button
                      type="submit"
                      className={`w-full py-3 px-4 ${verifying ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium rounded-lg transition flex items-center justify-center`}
                      disabled={verifying}
                    >
                      {verifying ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Verifying...
                        </>
                      ) : 'Verify Voter ID'}
                    </button>
                  </form>
                </div>
              ) : (
                /* Voting Form */
                <div className="p-8">
                  <div className="flex items-center mb-6">
                    <button
                      onClick={() => {
                        setShowVotingForm(false);
                        setShowVoterDetails(true);
                      }}
                      className="mr-2 text-blue-600 hover:text-blue-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                      </svg>
                    </button>
                    <h2 className="text-2xl font-semibold">Cast Your Vote</h2>
                  </div>
                  
                  <form onSubmit={handleVoteSubmit} className="space-y-6">
                    <div>
                      <label className="block text-gray-700 mb-3 font-medium">Select a Candidate</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {candidates.map((candidate) => (
                          <div
                            key={candidate.id}
                            className={`border ${
                              selectedCandidate === candidate.party
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            } rounded-lg p-4 cursor-pointer transition`}
                            onClick={() => setSelectedCandidate(candidate.party)}
                          >
                            <div className="flex items-center">
                              <div className={`w-5 h-5 rounded-full border ${
                                selectedCandidate === candidate.party
                                  ? 'border-blue-500 bg-blue-500'
                                  : 'border-gray-400'
                              } flex items-center justify-center mr-3`}>
                                {selectedCandidate === candidate.party && (
                                  <div className="w-3 h-3 rounded-full bg-white"></div>
                                )}
                              </div>
                              <div>
                                <h3 className="font-medium">{candidate.name}</h3>
                                <p className="text-sm text-gray-500">{candidate.party}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">Upload Your Fingerprint for Verification</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          onChange={handleFingerprintChange}
                          accept="image/*"
                          className="hidden"
                          id="fingerprint-input"
                          required
                        />
                        <label
                          htmlFor="fingerprint-input"
                          className="flex flex-col items-center cursor-pointer"
                        >
                          <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                          </svg>
                          {voterFingerprint ? (
                            <span className="text-blue-600 font-medium">
                              {voterFingerprint.name}
                            </span>
                          ) : (
                            <>
                              <span className="text-blue-600 font-medium">Click to upload</span>
                              <span className="text-sm text-gray-500 mt-1">
                                Upload a clear image of your fingerprint for verification
                              </span>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      className={`w-full py-3 px-4 ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium rounded-lg transition flex items-center justify-center`}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </>
                      ) : 'Cast My Vote'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            /* Success Screen */
            <div className="bg-white rounded-lg shadow-xl overflow-hidden text-center p-8">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Vote Cast Successfully!</h2>
              <p className="text-gray-600 mb-8">
                Thank you for participating in the election. Your vote has been recorded securely.
              </p>
              
              <button
                onClick={resetVoting}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
              >
                Return to Voter Verification
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VotePage;