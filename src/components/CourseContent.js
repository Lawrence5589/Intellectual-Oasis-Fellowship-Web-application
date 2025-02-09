import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProgressBar from './ProgressBar';
import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Sidebar from './Sidebar';

function CourseContent() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [userProgress, setUserProgress] = useState(0);
  const [completedModules, setCompletedModules] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      const courseDoc = doc(db, 'courses', courseId);
      const courseData = await getDoc(courseDoc);

      if (courseData.exists()) {
        setCourse(courseData.data());
        // Retrieve user-specific progress from your user database or service here
        // Example: setUserProgress(userData.progress);
      } else {
        console.error('Course does not exist');
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleModuleComplete = (currentModuleIndex) => {
    const newCompletedModules = [...completedModules, currentModuleIndex];
    setCompletedModules(newCompletedModules);

    const totalModules = course.modules.length;
    const newProgress = (newCompletedModules.length / totalModules) * 100;
    setUserProgress(newProgress);

    // Save new progress to your user's database
    // Example: updateUserProgress(userId, courseId, newCompletedModules);
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar open={sidebarOpen} toggleSidebar={handleSidebarToggle} />
      <div className="flex-1 flex flex-col p-6">
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
          <button onClick={handleSidebarToggle} className="text-2xl text-iof-dark hover:text-iof">
            &#9776; {/* Hamburger icon */}
          </button>
          <h1 className="text-xl font-bold text-iof">{course ? course.title : "Loading..."}</h1>
        </header>
        {course ? (
          <main className="space-y-8 mt-4">
            <ProgressBar progress={userProgress} />
            <div>
              {course.modules.map((module, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={completedModules.includes(index)}
                    onChange={() => handleModuleComplete(index)}
                    disabled={completedModules.includes(index)}
                    className="mr-2"
                  />
                  <h3 className="font-bold">{module.title}</h3>
                </div>
              ))}
            </div>
          </main>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
}

export default CourseContent;