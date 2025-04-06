import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [page, setPage] = useState('home');
  const [voters, setVoters] = useState([]);
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // For dynamic voter registration
  const [voterCount, setVoterCount] = useState('');
  const [registerVoters, setRegisterVoters] = useState([]);
  const [showVoterForm, setShowVoterForm] = useState(false);

  // For voting
  const [voterName, setVoterName] = useState('');
  const [voterFingerprint, setVoterFingerprint] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState('');

  // Fetch results
  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/results');
      setResults(response.data.results);
      setLoading(false);
    } catch (error) {
      setMessage('Error fetching results');
      setLoading(false);
    }
  };

  // Initialize voter forms based on count
  const initializeVoterForms = (count) => {
    if (!count || isNaN(count) || Number(count) <= 0) {
      setMessage('Please enter a valid number of voters');
      return;
    }
  
    const newVoters = Array.from({ length: Number(count) }, (_, index) => ({
      id: index.toString(),
      name: '',
      file: null
    }));
  
    setRegisterVoters(newVoters);
    setShowVoterForm(true);
    setMessage('');
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
    setMessage('');

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
      setMessage('Please provide at least one voter with name and fingerprint');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage(response.data.message);
      setLoading(false);
      setShowVoterForm(false); // Reset form after submission
      setVoterCount('');
    } catch (error) {
      setMessage('Error registering voters: ' + (error.response?.data?.message || error.message));
      setLoading(false);
    }
  };

  // Submit vote
  const handleVoteSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!voterName || !voterFingerprint || !selectedCandidate) {
      setMessage('Please fill in all vote details');
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
      setMessage(response.data.message);
      setLoading(false);
    } catch (error) {
      setMessage('Error casting vote: ' + (error.response?.data?.message || error.message));
      setLoading(false);
    }
  };

  // Navigation components
  const Navbar = () => (
    <div className="bg-white text-gray-800 p-4 px-8 max-w-7xl mx-auto shadow-[0px_0px_12px_8px_rgba(0,0,0,0.1)] mt-6 rounded-md">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Fingerprint Voting System</h1>
        <div className="flex space-x-4">
          <button 
            onClick={() => setPage('home')} 
            className={`px-3 py-2 hover:scale-[1.1] transform transition duration-400 ${page === 'home' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-700'}`}
          >
            Home
          </button>
          <button 
            onClick={() => {
              setPage('register');
              setShowVoterForm(false);
              setVoterCount('');
              setMessage('');
            }} 
            className={`px-3 py-2 hover:scale-[1.1] transform transition duration-400 ${page === 'register' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-700'}`}
          >
            Register Voters
          </button>
          <button 
            onClick={() => setPage('vote')} 
            className={`px-3 py-2 hover:scale-[1.1] transform transition duration-400 ${page === 'vote' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-700'}`}
          >
            Vote
          </button>
          <button 
            onClick={() => {
              setPage('results');
              fetchResults();
            }} 
            className={`px-3 py-2 hover:scale-[1.1] transform transition duration-400 ${page === 'results' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-700'}`}
          >
            Results
          </button>
        </div>
      </div>
    </div>
  );

  // Home Page
  const HomePage = () => (
    <div className="container mx-auto pl-6 pb-6 pr-6 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <h2 className="text-3xl font-bold mb-6">Welcome to the Fingerprint Voting System</h2>
        <p className="text-lg mb-8">
          This system provides a secure way to vote using fingerprint verification to ensure the integrity of the election process.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-100 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Step 1: Register</h3>
            <p>Register voters with their names and fingerprint images</p>
          </div>
          <div className="bg-green-100 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Step 2: Vote</h3>
            <p>Verify your identity with your fingerprint and cast your vote</p>
          </div>
          <div className="bg-purple-100 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Step 3: Results</h3>
            <p>View the election results in real-time</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Registration Page
  const RegisterPage = () => (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Register Voters</h2>
        
        {message && (
          <div className={`p-4 mb-6 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}
        
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

  // Voting Page
  const VotePage = () => (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Cast Your Vote</h2>
        
        {message && (
          <div className={`p-4 mb-6 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}
        
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
              className="w-full p-2 border rounded"
              accept="image/*"
            />
            {voterFingerprint && <p className="mt-1 text-sm text-gray-500">File selected: {voterFingerprint.name}</p>}
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Select Candidate</label>
            <select
              value={selectedCandidate}
              onChange={(e) => setSelectedCandidate(e.target.value)}
              className="w-full p-2 border rounded"
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

  // Results Page
  const ResultsPage = () => (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Election Results</h2>
        
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

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="pb-10 h-screen flex items-center">
        {page === 'home' && <HomePage />}
        {page === 'register' && <RegisterPage />}
        {page === 'vote' && <VotePage />}
        {page === 'results' && <ResultsPage />}
      </main>
      
      <footer className="bg-gray-800 text-white p-4 text-center">
        <p>© 2025 Fingerprint Voting System</p>
      </footer>
    </div>
  );
}

export default App;