import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

function DonationManagement() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDonation, setSelectedDonation] = useState(null);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const q = query(collection(db, 'donations'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const donationsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDonations(donationsData);
    } catch (err) {
      setError('Failed to fetch donations');
      console.error('Error fetching donations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (donationId, newStatus) => {
    try {
      const donationRef = doc(db, 'donations', donationId);
      await updateDoc(donationRef, { status: newStatus });
      fetchDonations(); // Refresh the list
    } catch (err) {
      setError('Failed to update donation status');
      console.error('Error updating donation status:', err);
    }
  };

  const handleDelete = async (donationId) => {
    if (window.confirm('Are you sure you want to delete this donation?')) {
      try {
        await deleteDoc(doc(db, 'donations', donationId));
        fetchDonations(); // Refresh the list
      } catch (err) {
        setError('Failed to delete donation');
        console.error('Error deleting donation:', err);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Donation Management</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {donations.map((donation) => (
              <tr key={donation.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {donation.timestamp?.toDate().toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{donation.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₦{donation.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={donation.status}
                    onChange={(e) => handleStatusChange(donation.id, e.target.value)}
                    className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(donation.status)}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => setSelectedDonation(donation)}
                    className="text-[rgb(130,88,18)] hover:text-[rgb(110,68,0)] mr-4"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleDelete(donation.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Donation Details Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Donation Details</h2>
              <button
                onClick={() => setSelectedDonation(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Donor Information</h3>
                <p>Name: {selectedDonation.name}</p>
                <p>Email: {selectedDonation.email}</p>
                <p>Phone: {selectedDonation.phone}</p>
              </div>
              <div>
                <h3 className="font-medium">Donation Details</h3>
                <p>Amount: ₦{selectedDonation.amount}</p>
                <p>Status: {selectedDonation.status}</p>
                <p>Date: {selectedDonation.timestamp?.toDate().toLocaleString()}</p>
              </div>
              {selectedDonation.message && (
                <div>
                  <h3 className="font-medium">Message</h3>
                  <p>{selectedDonation.message}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DonationManagement; 