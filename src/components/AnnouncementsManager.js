import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy, where, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../firebaseConfig';
import LoadingIndicator from './LoadingIndicator';

function AnnouncementsManager() {
  const [announcement, setAnnouncement] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');
  const auth = getAuth();

  // Check admin status using email
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!auth.currentUser?.email) {
        setLoading(false);
        return;
      }

      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', auth.currentUser.email));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          setIsAdmin(userData.isAdmin === true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        setIsAdmin(false);
      }
      
      setLoading(false);
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        checkAdminStatus();
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const announcementsRef = collection(db, 'announcements');
        const q = query(announcementsRef, orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        const announcementsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAnnouncements(announcementsList);
      } catch (error) {
        console.error('Error fetching announcements:', error);
      }
    };

    if (user) {
      fetchAnnouncements();
    }
  }, [user]);

  const handleAddAnnouncement = async () => {
    if (!user) {
      alert('You must be logged in to add announcements');
      return;
    }

    if (!isAdmin) {
      alert('Only administrators can add announcements');
      return;
    }

    if (!announcement.trim()) {
      return;
    }

    try {
      const newAnnouncement = {
        text: announcement,
        timestamp: new Date().toISOString(),
        createdBy: user.email,
        createdAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, 'announcements'), newAnnouncement);
      setAnnouncements([{ id: docRef.id, ...newAnnouncement }, ...announcements]);
      setAnnouncement('');
    } catch (error) {
      alert(`Error adding announcement: ${error.message}`);
    }
  };

  const handleEditAnnouncement = async (id) => {
    if (!editText.trim()) {
      return;
    }
    try {
      const announcementDoc = doc(db, 'announcements', id);
      await updateDoc(announcementDoc, { text: editText });
      setAnnouncements(announcements.map(a => a.id === id ? { ...a, text: editText } : a));
      setEditId(null);
      setEditText('');
    } catch (error) {
      alert(`Error editing announcement: ${error.message}`);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    try {
      const announcementDoc = doc(db, 'announcements', id);
      await deleteDoc(announcementDoc);
      setAnnouncements(announcements.filter(a => a.id !== id));
    } catch (error) {
      alert(`Error deleting announcement: ${error.message}`);
    }
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  if (!user) {
    return <div>Please log in to manage announcements.</div>;
  }

  if (!isAdmin) {
    return <div>You don't have permission to manage announcements.</div>;
  }

  return (
    <section id="announcements-manager" className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Manage Announcements</h2>
      <textarea
        value={announcement}
        onChange={(e) => setAnnouncement(e.target.value)}
        placeholder="Write your announcement here..."
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      />
      <button
        onClick={handleAddAnnouncement}
        className="mt-4 bg-[rgb(130,88,18)] text-white py-2 px-4 rounded-md hover:bg-[rgb(110,68,0)] transition-colors"
      >
        Add Announcement
      </button>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Previous Announcements</h3>
        {announcements.length === 0 ? (
          <p className="text-gray-500">No announcements yet</p>
        ) : (
          <div className="space-y-4">
            {announcements.map((item) => (
              <div key={item.id} className="border-l-4 border-[rgb(130,88,18)] pl-4 py-2">
                {editId === item.id ? (
                  <>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="mt-1 block w-full rounded-md"
                    />
                    <button onClick={() => handleEditAnnouncement(item.id)} className="mt-2 bg-[rgb(130,88,18)] text-white py-2 px-4 rounded-md hover:bg-[rgb(110,68,0)] transition-colors">Save</button>
                    <button onClick={() => setEditId(null)} className="mt-2 bg-gray-600 text-white px-4 py-2 rounded">Cancel</button>
                  </>
                ) : (
                  <>
                    <p className="text-gray-800">{item.text}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Posted by: {item.createdBy} on {new Date(item.timestamp).toLocaleDateString()}
                    </p>
                    <button onClick={() => { setEditId(item.id); setEditText(item.text); }} className="mt-2 bg-[rgb(130,88,18)] text-white py-2 px-4 rounded-md hover:bg-[rgb(110,68,0)] transition-colors mr-2">Edit</button>
                    <button onClick={() => handleDeleteAnnouncement(item.id)} className="mt-2 bg-red-600 text-white px-4 py-2 rounded">Delete</button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <LoadingIndicator />
          </div>
        )}
        </div>
    </section>
  );
}

export default AnnouncementsManager;