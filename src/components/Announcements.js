import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

function Announcements() {
  const [latestAnnouncement, setLatestAnnouncement] = useState('');
  const [announcementData, setAnnouncementData] = useState(null);

  useEffect(() => {
    const fetchLatestAnnouncement = async () => {
      try {
        const announcementsRef = collection(db, 'announcements');
        const q = query(announcementsRef, orderBy('timestamp', 'desc'), limit(1));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const announcement = querySnapshot.docs[0].data();
          setLatestAnnouncement(announcement.text);
          setAnnouncementData(announcement);
        }
      } catch (error) {
        console.error('Error fetching announcement:', error);
      }
    };

    fetchLatestAnnouncement();
  }, []);

  if (!latestAnnouncement) {
    return null;
  }

  return (
    <section id="announcements" className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-[rgb(130,88,18)] to-[rgb(160,108,22)] px-6 py-4">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 mr-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" 
            />
          </svg>
          Announcements
        </h2>
      </div>
      
      <div className="p-6">
        <div className="bg-[rgb(250,245,235)] border-l-4 border-[rgb(130,88,18)] rounded-r-lg">
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg 
                  className="h-5 w-5 text-[rgb(130,88,18)]" 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-lg leading-relaxed text-gray-800 whitespace-pre-wrap">
                  {latestAnnouncement}
                </p>
                {announcementData && (
                  <div className="mt-3 text-sm text-[rgb(130,88,18)]">
                    <time dateTime={announcementData.timestamp}>
                      {new Date(announcementData.timestamp).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </time>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Announcements;