import React, { useState, useEffect } from 'react';
import { databases, storage, DATABASE_ID, COLLECTION_ID, STORAGE_BUCKET_ID } from '../../appwriteConfig';
import { Link } from 'react-router-dom';
import { HiOutlineUsers, HiOutlineDocumentReport, HiOutlineChartBar } from "react-icons/hi";
import { HiOutlineUserAdd } from "react-icons/hi";
import { HiOutlineClock } from "react-icons/hi2";
import adminImg from './../assets/manager.png';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 

const AdminDashboard = () => {
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVoters: 0,
    registeredToday: 0,
    votersAge18To25: 0,
    votersAge26Plus: 0
  });
  const [error, setError] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchVoters();
  }, []);

  const fetchVoters = async () => {
    try {
      setLoading(true);
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID
      );

      setVoters(response.documents);
      
      // Calculate stats
      const today = new Date().toISOString().split('T')[0].split('-').reverse().join('-');
      const todayCount = response.documents.filter(voter => {
        // Assuming created date is available or using a placeholder
        const createdAt = voter.$createdAt ? voter.$createdAt.split('T')[0] : today;
        return createdAt === today;
      }).length;
      
      const youngVoters = response.documents.filter(voter => voter.age >= 18 && voter.age <= 25).length;
      const olderVoters = response.documents.filter(voter => voter.age > 25).length;
      
      setStats({
        totalVoters: response.documents.length,
        registeredToday: todayCount,
        votersAge18To25: youngVoters,
        votersAge26Plus: olderVoters
      });
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching voters:", error);
      setError("Failed to load voter data. Please try again later.");
      setLoading(false);
    }
  };

  const getVoterIdImageUrl = async (fileId) => {
    try {
      const result = await storage.getFileView(STORAGE_BUCKET_ID, fileId);
      return result;
    } catch (error) {
      console.error("Error getting file URL:", error);
      return null;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    
    return `${parts[0]}-${parts[1]}-${parts[2]}`;
  };

  const exportToPDF = async () => {
    try {
      setExportLoading(true);
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text("Registered Voters Report", 14, 22);
      
      // Add date
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 30);
      
      // Add stats summary
      doc.setFontSize(12);
      doc.setTextColor(40, 40, 40);
      doc.text("Summary:", 14, 40);
      doc.setFontSize(10);
      doc.text(`Total Voters: ${stats.totalVoters}`, 20, 48);
      doc.text(`Registered Today: ${stats.registeredToday}`, 20, 54);
      doc.text(`Voters Age 18-25: ${stats.votersAge18To25}`, 20, 60);
      doc.text(`Voters Age 26+: ${stats.votersAge26Plus}`, 20, 66);
      
      // Create table with data
      const tableColumn = ["User ID", "Name", "Date of Birth", "Age", "Address"];
      const tableRows = [];
      
      voters.forEach(voter => {
        const voterData = [
          voter.userId,
          voter.name,
          formatDate(voter.dob),
          voter.age,
          voter.address
        ];
        tableRows.push(voterData);
      });
      
      // Create the PDF table
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 75,
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240]
        },
        margin: { top: 15 },
        styles: { overflow: 'linebreak' },
        columnStyles: {
          4: { cellWidth: 'auto' }
        },
      });
      
      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Page ' + String(i) + ' of ' + String(pageCount), pageSize.width - 30, pageHeight - 10);
        doc.text('© 2025 Election Commission', 14, pageHeight - 10);
      }
      
      // Save the PDF with a specific name
      doc.save(`Voters_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      
      setExportLoading(false);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setExportLoading(false);
      alert("Failed to export data. Please try again.");
    }
  };

  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Admin Welcome Card */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-700 rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="px-8 py-10 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                  <p className="mt-2 opacity-90">Manage the Fingerprint Voting System</p>
                </div>
                <div className="bg-white/50 backdrop-blur-sm p-3 rounded-full">
                  <img src={adminImg} alt="Admin" className="w-16 h-auto" />
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center">
                  <div className="bg-white/20 p-3 rounded-full mr-3">
                    <HiOutlineUsers className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Total Voters</p>
                    <h3 className="text-xl font-bold">{stats.totalVoters}</h3>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center">
                  <div className="bg-white/20 p-3 rounded-full mr-3">
                    <HiOutlineClock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Registered Today</p>
                    <h3 className="text-xl font-bold">{stats.registeredToday}</h3>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center">
                  <div className="bg-white/20 p-3 rounded-full mr-3">
                    <HiOutlineChartBar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Age 18-25</p>
                    <h3 className="text-xl font-bold">{stats.votersAge18To25}</h3>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center">
                  <div className="bg-white/20 p-3 rounded-full mr-3">
                    <HiOutlineDocumentReport className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Age 26+</p>
                    <h3 className="text-xl font-bold">{stats.votersAge26Plus}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link to="/register-voters" className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-200 border-l-4 border-blue-500 flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <HiOutlineUserAdd className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Register Voters</h3>
                <p className="text-gray-600 text-sm">Add new voters to the system</p>
              </div>
            </Link>
            
            <Link to="/vote" className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-200 border-l-4 border-green-500 flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Voting Station</h3>
                <p className="text-gray-600 text-sm">Manage the voting process</p>
              </div>
            </Link>
            
            <Link to="/results" className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-200 border-l-4 border-purple-500 flex items-center">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Election Results</h3>
                <p className="text-gray-600 text-sm">View real-time voting statistics</p>
              </div>
            </Link>
          </div>
          
          {/* Admin Message */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8 border-l-4 border-yellow-500">
            <div className="flex items-start">
              <div className="bg-yellow-100 p-3 rounded-full mr-4">
                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Admin Notice</h3>
                <div className="mt-2 text-gray-600">
                  <p>Welcome to the Election Management System. This dashboard provides a comprehensive overview of registered voters and election statistics.</p>
                  <p className="mt-2">Please ensure all voter registrations are verified with proper ID checks before approval. For any technical issues, contact the IT support team.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Voters Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">Registered Voters</h3>
                <button 
                  onClick={fetchVoters}
                  className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition flex items-center"
                >
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  Refresh
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="p-6 text-center text-red-500">
                {error}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider">User ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider">Date of Birth</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider">Age</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider">Address</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider">Voter ID</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {voters.length > 0 ? (
                      voters.map((voter) => (
                        <tr key={voter.$id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{voter.userId}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">{voter.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(voter.dob)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{voter.age}</td>
                          <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{voter.address}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {voter.voteridFileID ? (
                              <button 
                                className="text-blue-900 hover:text-blue-950 hover:underline"
                                onClick={async () => {
                                  const url = await getVoterIdImageUrl(voter.voteridFileID);
                                  if (url) {
                                    window.open(url, '_blank');
                                  }
                                }}
                              >
                                View ID
                              </button>
                            ) : (
                              "No ID"
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                          No voters found in the system
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            
            {voters.length > 0 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{voters.length}</span> voters
                </div>
                
                <div className="flex-1 flex justify-end">
                <button 
                    onClick={exportToPDF}
                    disabled={exportLoading}
                    className={`${
                      exportLoading 
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed" 
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    } px-4 py-2 rounded-lg flex items-center transition shadow-sm duration-200`}
                  >
                    {exportLoading ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Exporting...
                      </>
                    ) : (
                      <>
                        Export Data
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="text-center mt-6 text-gray-500 text-sm">
            <p>© 2025 Election Commission. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;