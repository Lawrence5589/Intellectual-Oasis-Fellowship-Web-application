import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy, where } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../firebaseConfig';

function AnnouncementsManager() {
  const [announcement, setAnnouncement] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  // Check admin status using email instead of UID
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!auth.currentUser?.email) {
        console.log('No user email available');
        setLoading(false);
        return;
      }

      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', auth.currentUser.email));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          console.log('Found user data:', userData);
          setIsAdmin(userData.isAdmin === true);
        } else {
          console.log('No user found with email:', auth.currentUser.email);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
      
      setLoading(false);
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Auth state changed:', currentUser?.email);
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

  // Fetch announcements
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
      console.log('No user logged in');
      alert('You must be logged in to add announcements');
      return;
    }

    if (!isAdmin) {
      console.log('User is not admin:', user.email);
      alert('Only administrators can add announcements');
      return;
    }

    if (!announcement.trim()) {
      return;
    }

    try {
      console.log('Creating announcement as user:', user.email);
      console.log('Admin status:', isAdmin);
      
      const newAnnouncement = {
        text: announcement,
        timestamp: new Date().toISOString(),
        createdBy: user.email, // Store email instead of UID
        createdAt: new Date()
      };
      
      console.log('Attempting to create announcement:', newAnnouncement);
      
      const docRef = await addDoc(collection(db, 'announcements'), newAnnouncement);
      console.log('Successfully created announcement:', docRef.id);
      
      setAnnouncements([{ id: docRef.id, ...newAnnouncement }, ...announcements]);
      setAnnouncement('');
    } catch (error) {
      console.error('Error adding announcement:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        userEmail: user.email,
        isAdmin: isAdmin
      });
      alert(`Error adding announcement: ${error.message}`);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
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
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
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
              <div key={item.id} className="border-l-4 border-blue-500 pl-4 py-2">
                <p className="text-gray-800">{item.text}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Posted by: {item.createdBy} on {new Date(item.timestamp).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default AnnouncementsManager;