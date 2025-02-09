import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProgressBar from './ProgressBar';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Sidebar from './Sidebar';
import LoadingIndicator from './LoadingIndicator';
import { useAuth } from '../contexts/AuthContext';

function CourseContent() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [course, setCourse] = useState(null);
    const [userProgress, setUserProgress] = useState(0);
    const [completedSubCourses, setCompletedSubCourses] = useState({});
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourseAndProgress = async () => {
            setLoading(true);
            try {
                // Fetch course data
                const courseDoc = doc(db, 'courses', courseId);
                const courseData = await getDoc(courseDoc);

                if (courseData.exists()) {
                    const data = courseData.data();
                    // Ensure modules is always an array
                    data.modules = data.modules || [];
                    setCourse(data);

                    // Fetch completed subcourses
                    const completedRef = doc(db, 'users', user.uid, 'completedSubCourses', courseId);
                    const completedDoc = await getDoc(completedRef);
                    
                    if (completedDoc.exists()) {
                        const completedData = completedDoc.data().completed || {};
                        setCompletedSubCourses(completedData);

                        // Calculate progress
                        const totalSubCourses = data.modules.reduce(
                            (total, module) => total + (module.subCourses?.length || 0),
                            0
                        );
                        const completedCount = Object.keys(completedData).length;
                        const progress = (completedCount / totalSubCourses) * 100;
                        setUserProgress(progress);
                    }
                } else {
                    console.error('Course does not exist');
                }
            } catch (error) {
                console.error('Error fetching course:', error);
            }
            setLoading(false);
        };

        if (user && courseId) {
            fetchCourseAndProgress();
        }
    }, [courseId, user]);

    const isSubCourseCompleted = (moduleId, subCourseId) => {
        const completionKey = `${moduleId}_${subCourseId}`;
        return completedSubCourses[completionKey] !== undefined;
    };

    const handleSubCourseClick = (moduleIndex, subCourseIndex) => {
        const module = course.modules[moduleIndex];
        const subCourse = module.subCourses[subCourseIndex];
        navigate(`/courses/${courseId}/content/${module.moduleId}/${subCourse.subCourseId}`);
    };

    const handleSidebarToggle = () => {
        setSidebarOpen(!sidebarOpen);
    };

    if (loading) {
        return <LoadingIndicator />;
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar open={sidebarOpen} toggleSidebar={handleSidebarToggle} />
            <div className="flex-1 flex flex-col">
                <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
                    <button onClick={handleSidebarToggle} className="text-2xl text-gray-700 hover:text-gray-600">
                        &#9776;
                    </button>
                    <h1 className="text-xl font-bold text-gray-800">{course?.title}</h1>
                </header>
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-lg font-bold mb-4">To complete the courses and earn your certificate, please follow these steps:</h2>
                    <ul className="list-disc pl-5 text-gray-700">
                        <li>Start with the First Course: You must complete courses in order.</li>
                        <li>Pass Each Evaluation: A minimum score of 75% is required to pass each course evaluation.</li>
                        <li>
                            Upon Submission, ensure you get "Results Submitted Successfully" before clicking Mark Complete.
                        </li>
                        <li>
                            During Submission of Practical Exercises, include your name in the Title for supervisor discussions.
                        </li>
                        <li>Check Your Progress: Completed courses will be marked with a tick on your schedule page.</li>
                        <li>Finish All Courses: Download your certificate after passing all courses.</li>
                    </ul>
                </div>

                <div className="p-6">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">Course Progress</h2>
                        <ProgressBar progress={userProgress} />
                    </div>

                    <main className="space-y-8">
                        {Array.isArray(course?.modules) && course.modules.map((module, moduleIndex) => (
                            <div key={moduleIndex} className="bg-white p-4 rounded-lg shadow-md">
                                <h2 className="font-bold text-lg text-[rgb(130,88,18)]">
                                    {module.title || module.moduleId}
                                </h2>
                                <div className="ml-4 mt-2">
                                    {Array.isArray(module.subCourses) && module.subCourses.map((subCourse, subCourseIndex) => (
                                        <div key={subCourseIndex} 
                                             className="flex items-center justify-between my-2 p-2 bg-gray-50 rounded-md">
                                            <span
                                                className="font-normal cursor-pointer transform transition-transform duration-200 hover:scale-105 hover:text-iof"
                                                onClick={() => handleSubCourseClick(moduleIndex, subCourseIndex)}
                                            >
                                                {subCourse.title}
                                            </span>
                                            <div className="flex items-center">
                                                {isSubCourseCompleted(module.moduleId, subCourse.subCourseId) && (
                                                    <span className="text-green-600 mr-2">✓</span>
                                                )}
                                                <input
                                                    type="checkbox"
                                                    checked={isSubCourseCompleted(module.moduleId, subCourse.subCourseId)}
                                                    readOnly
                                                    className="ml-2"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </main>
                </div>
            </div>
        </div>
    );
}

export default CourseContent;