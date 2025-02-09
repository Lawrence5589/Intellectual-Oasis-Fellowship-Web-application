import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, doc, deleteDoc, updateDoc, addDoc } from 'firebase/firestore';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        setUsers(usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error fetching users: ', error);
      }
    };

    fetchUsers();
  }, []);

  const handleAddUser = async () => {
    try {
      await addDoc(collection(db, 'users'), {
        email: newUserEmail,
        isAdmin: false,
        createdAt: new Date(),
        lastLogin: null,
      });
      setNewUserEmail('');
      alert('User added successfully!');
    } catch (error) {
      console.error('Error adding user: ', error);
      setError('Failed to add user');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(users.filter(user => user.id !== userId));
      alert('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user: ', error);
      setError('Failed to delete user');
    }
  };

  const handleMakeAdmin = async (userId, isAdmin) => {
    try {
      await updateDoc(doc(db, 'users', userId), { isAdmin: !isAdmin });
      alert('User role updated successfully!');
    } catch (error) {
      console.error('Error updating user role: ', error);
      setError('Failed to update user role');
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  return (
    <section id="user-management" className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">User Management</h2>
      {error && <p className="text-red-500">{error}</p>}
      <div className="mb-4 flex space-x-2">
        <input
          type="email"
          placeholder="New user email"
          value={newUserEmail}
          onChange={(e) => setNewUserEmail(e.target.value)}
          className="p-2 border rounded mr-2"
        />
        <button onClick={handleAddUser} className="bg-iof text-white px-4 py-2 rounded hover:bg-green-700">
          Add User
        </button>
      </div>
      <input
        type="text"
        placeholder="Search users"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4 p-2 border rounded w-full"
      />
      <div className="max-h-64 overflow-y-auto">
        <ul>
          {paginatedUsers.map(user => (
            <li key={user.id} className="flex justify-between items-center mb-2">
              <div>
                <p>{user.email}</p>
                <p>Date Created: {user.createdAt && user.createdAt.toDate().toLocaleDateString()}</p>
                <p>Last Login: {user.lastLogin ? user.lastLogin.toDate().toLocaleDateString() : 'Never'}</p>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => handleMakeAdmin(user.id, user.isAdmin)} className={`px-2 py-1 rounded ${user.isAdmin ? 'bg-yellow-500' : 'bg-iof-light'} hover:bg-opacity-80`}>
                  {user.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                </button>
                <button onClick={() => handleDeleteUser(user.id)} className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-4 flex justify-center space-x-2">
        <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50">
          Previous
        </button>
        <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50">
          Next
        </button>
      </div>
    </section>
  );
}

export default UserManagement;