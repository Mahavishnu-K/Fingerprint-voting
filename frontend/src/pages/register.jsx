import React, { useState, useEffect } from 'react';
import { databases, ID, storage, DATABASE_ID, COLLECTION_ID, STORAGE_BUCKET_ID } from '../../appwriteConfig';
import { Permission, Role } from 'appwrite';
import { HiOutlineUserAdd } from "react-icons/hi";
import { HiOutlineUserGroup } from "react-icons/hi2";
import axios from 'axios';

const RegisterPage = () => {
  const [voters, setVoters] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); 
  const [showMessage, setShowMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [voterCount, setVoterCount] = useState('');
  const [registerVoters, setRegisterVoters] = useState([]);
  const [showVoterForm, setShowVoterForm] = useState(false);

  useEffect(() => {
    let timer;
    if (showMessage) {
      timer = setTimeout(() => {
        setShowMessage(false);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [showMessage]);

  const displayMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setShowMessage(true);
  };

  const initializeVoterForms = (count) => {
    if (!count || isNaN(count) || Number(count) <= 0) {
      displayMessage('Please enter a valid number of voters', 'error');
      return;
    }
  
    const newVoters = Array.from({ length: Number(count) }, (_, index) => ({
      id: index.toString(),
      name: '',
      dob: '',
      voterId: '',
      address: '',
      file: null,
      voterIdImage: null
    }));
  
    setRegisterVoters(newVoters);
    setShowVoterForm(true);
  };

  const handleRegisterChange = (index, field, value) => {
    const newVoters = [...registerVoters];
    newVoters[index] = { ...newVoters[index], [field]: value };
    setRegisterVoters(newVoters);
    
    // Validate age when DOB is changed
    if (field === 'dob' && value) {
      const birthDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDifference = today.getMonth() - birthDate.getMonth();
      
      // Adjust age if birthday hasn't occurred yet this year
      if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      // Show warning if under 18
      if (age < 18) {
        displayMessage(`Warning: Voter ${index + 1} is ${age} years old. Voters must be at least 18 years old to register.`, 'error');
      }
    }
  };

  const handleFileChange = (index, e, fileType) => {
    const file = e.target.files[0];
    handleRegisterChange(index, fileType, file);
  };

  // Calculate age from date of birth
  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    // Adjust age if birthday hasn't occurred yet this year
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Create form data for API
    const formData = new FormData();
    let validVotersCount = 0;

    // Process each voter
    for (let index = 0; index < registerVoters.length; index++) {
      const voter = registerVoters[index];
      
      // Validate required fields
      if (!voter.name || !voter.dob || !voter.voterId || !voter.address || !voter.file || !voter.voterIdImage) {
        displayMessage('All fields are required for each voter', 'error');
        setLoading(false);
        return;
      }
      
      // Calculate age using the extracted function
      const age = calculateAge(voter.dob);
      
      // Verify voter is at least 18 years old
      if (age < 18) {
        displayMessage(`Voter ${index + 1} (${voter.name}) must be at least 18 years old to register.`, 'error');
        setLoading(false);
        return;
      }
      
      // Add to form data for API
      formData.append(`name_${index}`, voter.name);
      formData.append(`fingerprint_${index}`, voter.file);
      validVotersCount++;
      
      try {
        // Upload voter ID image to Appwrite Storage
        const voterIdUpload = await storage.createFile(
          STORAGE_BUCKET_ID,
          ID.unique(),
          voter.voterIdImage
        );

        voter.dob = voter.dob.split('-').reverse().join('-');        
        
        // Make sure age is a valid integer
        const voterAge = age || 0;
        
        console.log("Creating document with age:", voterAge); // Debug log
        
        // Create document in Appwrite Database with address field
        await databases.createDocument(
          DATABASE_ID,
          COLLECTION_ID,
          ID.unique(),
          {
            userId: voter.voterId,
            name: voter.name,
            dob: voter.dob,
            age: voterAge,
            address: voter.address,
            voteridFileID: voterIdUpload.$id
          },
          [
            Permission.read(Role.user('67fb59f5002fecfeff00')),
            Permission.update(Role.user('67fb59f5002fecfeff00')),
            Permission.delete(Role.user('67fb59f5002fecfeff00'))
          ]
        );
      } catch (error) {
        console.error("Appwrite error:", error); // Debug log
        displayMessage('Error saving to Appwrite: ' + error.message, 'error');
        setLoading(false);
        return;
      }
    }

    formData.append('voter_count', validVotersCount.toString());

    try {
      // Send to API endpoint
      const response = await axios.post('http://localhost:5000/api/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      displayMessage(response.data.message, 'success');
      setLoading(false);
      setShowVoterForm(false); 
      setVoterCount('');
    } catch (error) {
      displayMessage('Error registering voters: ' + (error.response?.data?.message || error.message), 'error');
      setLoading(false);
    }
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

  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Modern Message Popup */}
          <MessagePopup />
          
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-700 text-white p-6">
              <h1 className="text-3xl font-bold">Voter Registration</h1>
              <p className="mt-2 opacity-90">Register new voters for the election</p>
            </div>
            
            <div className="p-8">
              {!showVoterForm ? (
                <div className="bg-white rounded-xl">
                  <div className="mb-8 text-center max-w-lg mx-auto">
                    <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <HiOutlineUserAdd size={32} color='blue'/>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">How many voters would you like to register?</h3>
                    <p className="text-gray-600 mb-6">Enter the number of voters you want to register in the voting system</p>
                    
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                      <input
                        type="number"
                        value={voterCount}
                        onChange={(e) => setVoterCount(e.target.value)}
                        className="w-full md:w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="Enter number of voters"
                        min="1"
                        max="100"
                      />
                      <button
                        onClick={() => initializeVoterForms(voterCount)}
                        className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRegisterSubmit}>
                  <div className="mb-6 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-full mr-3">
                       <HiOutlineUserGroup size={22} color='blue'/>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800">Registering {registerVoters.length} voters</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowVoterForm(false)}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                      </svg>
                      Change number of voters
                    </button>
                  </div>
                  
                  <div className="mb-6 max-h-96 overflow-y-auto rounded-xl border border-gray-200 shadow-inner bg-gray-50">
                    {registerVoters.map((voter, index) => (
                      <div key={voter.id} className="mb-4 mx-4 mt-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                        <div className="flex items-center mb-4">
                          <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-semibold mr-3">
                            {index + 1}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800">Voter Information</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2">Full Name <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              value={voter.name}
                              onChange={(e) =>
                                handleRegisterChange(index, 'name', e.target.value)
                              }
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                              placeholder="Enter full name"
                              required
                            />
                          </div>

                          <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2">Date of Birth <span className="text-red-500">*</span></label>
                            <input
                              type="date"
                              value={voter.dob}
                              onChange={(e) =>
                                handleRegisterChange(index, 'dob', e.target.value)
                              }
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-gray-700 text-sm font-medium mb-2">Voter ID <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            value={voter.voterId}
                            onChange={(e) =>
                              handleRegisterChange(index, 'voterId', e.target.value)
                            }
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="Enter your voter ID"
                            required
                          />
                        </div>

                        <div className="mb-4">
                          <label className="block text-gray-700 text-sm font-medium mb-2">Address <span className="text-red-500">*</span></label>
                          <textarea
                            value={voter.address}
                            onChange={(e) =>
                              handleRegisterChange(index, 'address', e.target.value)
                            }
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="Enter complete address"
                            rows="3"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2">Fingerprint Image <span className="text-red-500">*</span></label>
                            <div className="relative">
                              <input
                                type="file"
                                onChange={(e) => handleFileChange(index, e, 'file')}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                accept="image/*"
                                required
                              />
                            </div>
                            {voter.file && (
                              <p className="mt-1 text-sm text-gray-500 flex items-center">
                                <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                {voter.file.name}
                              </p>
                            )}
                          </div>

                          <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2">Voter ID Image <span className="text-red-500">*</span></label>
                            <div className="relative">
                              <input
                                type="file"
                                onChange={(e) => handleFileChange(index, e, 'voterIdImage')}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                accept="image/*"
                                required
                              />
                            </div>
                            {voter.voterIdImage && (
                              <p className="mt-1 text-sm text-gray-500 flex items-center">
                                <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                {voter.voterIdImage.name}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <button 
                      type="submit" 
                      className={`flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg transition duration-200 ${
                        loading ? 'opacity-75 cursor-not-allowed' : 'hover:bg-blue-700 shadow-sm hover:shadow-md'
                      }`}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Registering...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          Register Voters
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
          
          <div className="text-center mt-6 text-gray-500 text-sm">
            <p>© 2025 Election Commission. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;