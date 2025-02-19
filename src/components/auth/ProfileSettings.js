import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebaseConfig';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';
import { FiUser, FiMail, FiLock, FiSave, FiX, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

function ProfileSettings() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    newPassword: '',
    confirmPassword: '',
    currentPassword: ''
  });

  useEffect(() => {
    const initializeForm = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          const userData = userDoc.data();
          setFormData(prev => ({
            ...prev,
            displayName: currentUser.displayName || userData?.name || '',
            email: currentUser.email || userData?.email || ''
          }));
        } catch (err) {
          console.error('Error fetching user data:', err);
          setError('Failed to load user data');
        } finally {
          setLoading(false);
        }
      }
    };

    initializeForm();
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const updates = [];

      if (formData.displayName !== currentUser.displayName) {
        updates.push(updateProfile(auth.currentUser, {
          displayName: formData.displayName
        }));
      }

      if (formData.email !== currentUser.email) {
        updates.push(updateEmail(auth.currentUser, formData.email));
      }

      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (formData.newPassword.length < 6) {
          throw new Error('Password should be at least 6 characters');
        }
        updates.push(updatePassword(auth.currentUser, formData.newPassword));
      }

      await Promise.all(updates);

      const userDoc = doc(db, 'users', currentUser.uid);
      await updateDoc(userDoc, {
        displayName: formData.displayName,
        email: formData.email,
        updatedAt: new Date()
      });

      setSuccess('Profile updated successfully');
      setFormData(prev => ({
        ...prev,
        newPassword: '',
        confirmPassword: '',
        currentPassword: ''
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-lg">
        {/* Header */}
        <div className="md:flex md:items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <FiArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-xl font-semibold text-gray-800">Profile Settings</h2>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError('')}><FiX className="w-5 h-5" /></button>
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg flex items-center justify-between">
              <span>{success}</span>
              <button onClick={() => setSuccess('')}><FiX className="w-5 h-5" /></button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(130,88,18)] focus:border-transparent"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(130,88,18)] focus:border-transparent"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(130,88,18)] focus:border-transparent"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(130,88,18)] focus:border-transparent"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[rgb(130,88,18)] hover:bg-[rgb(110,68,0)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(130,88,18)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <FiSave className="w-5 h-5 mr-2" />
                {loading ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfileSettings;