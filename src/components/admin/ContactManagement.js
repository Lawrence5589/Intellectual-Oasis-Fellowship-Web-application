import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import AdminRoute from '../auth/AdminRoute';

function ContactManagement() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

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
      setError('Error fetching submissions: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'contactSubmissions', id), {
        status: newStatus
      });
      fetchSubmissions(); // Refresh the list
    } catch (err) {
      setError('Error updating status: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this submission?')) {
      try {
        await deleteDoc(doc(db, 'contactSubmissions', id));
        fetchSubmissions(); // Refresh the list
      } catch (err) {
        setError('Error deleting submission: ' + err.message);
      }
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Contact Submissions Management</h1>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">Date</th>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Type</th>
              <th className="px-4 py-2 border">Subject</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission) => (
              <tr key={submission.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">
                  {submission.timestamp?.toDate().toLocaleDateString()}
                </td>
                <td className="px-4 py-2 border">{submission.name}</td>
                <td className="px-4 py-2 border">{submission.email}</td>
                <td className="px-4 py-2 border">{submission.type}</td>
                <td className="px-4 py-2 border">{submission.subject}</td>
                <td className="px-4 py-2 border">
                  <select
                    value={submission.status || 'pending'}
                    onChange={(e) => handleStatusChange(submission.id, e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={() => handleDelete(submission.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for viewing submission details */}
      <div className="mt-4">
        {submissions.map((submission) => (
          <div key={submission.id} className="mb-4 p-4 border rounded">
            <h3 className="font-semibold mb-2">Message:</h3>
            <p className="text-gray-600">{submission.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ContactManagement; 