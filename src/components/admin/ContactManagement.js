import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../contexts/AuthContext';

function ContactManagement() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [resolutionComment, setResolutionComment] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role?.startsWith('admin-')) {
      fetchSubmissions();
    }
  }, [user]);

  const fetchSubmissions = async () => {
    try {
      const q = query(collection(db, 'contactSubmissions'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const submissionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSubmissions(submissionsData);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError('Error fetching submissions. Please check your permissions and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'contactSubmissions', id), {
        status: newStatus,
        lastUpdated: new Date(),
        updatedBy: user.email
      });
      fetchSubmissions();
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Error updating status. Please try again.');
    }
  };

  const handleAddResolution = async (id) => {
    if (!resolutionComment.trim()) return;
    
    try {
      const submissionRef = doc(db, 'contactSubmissions', id);
      const submission = submissions.find(s => s.id === id);
      const existingResolutions = submission.resolutions || [];
      
      await updateDoc(submissionRef, {
        resolutions: [...existingResolutions, {
          comment: resolutionComment,
          timestamp: new Date(),
          addedBy: user.email
        }],
        lastUpdated: new Date(),
        updatedBy: user.email
      });
      
      setResolutionComment('');
      fetchSubmissions();
    } catch (err) {
      console.error('Error adding resolution:', err);
      setError('Error adding resolution. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this submission?')) {
      try {
        await deleteDoc(doc(db, 'contactSubmissions', id));
        fetchSubmissions();
      } catch (err) {
        console.error('Error deleting submission:', err);
        setError('Error deleting submission. Please try again.');
      }
    }
  };

  const handleCloseModal = () => {
    setSelectedSubmission(null);
    setResolutionComment('');
  };

  const handleViewDetails = (submission) => {
    setSelectedSubmission(submission);
    setResolutionComment('');
  };

  const filteredSubmissions = submissions.filter(submission => 
    filterStatus === 'all' ? true : submission.status === filterStatus
  );

  if (!user?.role?.startsWith('admin-')) {
    return <div className="p-4 text-red-600">You do not have permission to access this page.</div>;
  }

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[rgb(130,88,18)]">Contact Submissions Management</h1>
        <div className="flex gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[rgb(130,88,18)]"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSubmissions.map((submission) => (
          <div
            key={submission.id}
            className="bg-white rounded-lg shadow-md p-4 border hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-[rgb(130,88,18)]">{submission.name}</h3>
                <p className="text-sm text-gray-600">{submission.email}</p>
              </div>
              <span className={`px-2 py-1 rounded text-sm ${
                submission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                submission.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                submission.status === 'resolved' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {submission.status.replace('_', ' ')}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">
              {submission.timestamp?.toDate().toLocaleDateString()}
            </p>
            
            <p className="text-gray-700 mb-4 line-clamp-2">{submission.message}</p>
            
            <div className="flex justify-between items-center">
              <button
                onClick={() => handleViewDetails(submission)}
                className="text-[rgb(130,88,18)] hover:text-[rgb(130,88,18)]/80 text-sm font-medium"
              >
                View Details
              </button>
              <button
                onClick={() => handleDelete(submission.id)}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for viewing submission details */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-[rgb(130,88,18)]">Submission Details</h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-[rgb(130,88,18)]">Contact Information</h3>
                  <p>Name: {selectedSubmission.name}</p>
                  <p>Email: {selectedSubmission.email}</p>
                  <p>Type: {selectedSubmission.type}</p>
                  <p>Date: {selectedSubmission.timestamp?.toDate().toLocaleString()}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-[rgb(130,88,18)]">Message</h3>
                  <p className="whitespace-pre-wrap">{selectedSubmission.message}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-[rgb(130,88,18)]">Status</h3>
                  <select
                    value={selectedSubmission.status || 'pending'}
                    onChange={(e) => handleStatusChange(selectedSubmission.id, e.target.value)}
                    className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[rgb(130,88,18)]"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div>
                  <h3 className="font-semibold text-[rgb(130,88,18)]">Resolution History</h3>
                  <div className="space-y-2">
                    {selectedSubmission.resolutions?.map((resolution, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-600">{resolution.comment}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          By {resolution.addedBy} on {resolution.timestamp.toDate().toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-[rgb(130,88,18)]">Add Resolution Comment</h3>
                  <textarea
                    value={resolutionComment}
                    onChange={(e) => setResolutionComment(e.target.value)}
                    className="border rounded px-3 py-2 w-full h-24 focus:outline-none focus:ring-2 focus:ring-[rgb(130,88,18)]"
                    placeholder="Add a resolution comment..."
                  />
                  <button
                    onClick={() => handleAddResolution(selectedSubmission.id)}
                    className="mt-2 bg-[rgb(130,88,18)] text-white px-4 py-2 rounded hover:bg-[rgb(130,88,18)]/90 transition-colors"
                  >
                    Add Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContactManagement; 