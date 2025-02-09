import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

function CoursePresentation() {
    const { courseId, moduleTitle, subCourseId } = useParams();
    const navigate = useNavigate();
    const [presentationData, setPresentationData] = useState(null);
    const [sourceType, setSourceType] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPresentation = async () => {
            try {
                const courseDoc = doc(db, 'courses', courseId);
                const courseSnapshot = await getDoc(courseDoc);
    
                if (courseSnapshot.exists()) {
                    const courseData = courseSnapshot.data();
                    // Find the module that contains our subCourse
                    const module = courseData.modules.find(m => m.moduleId === moduleTitle);
                    
                    if (module && module.subCourses) {
                        // Find the specific subCourse using subCourseId
                        const subCourse = module.subCourses.find(sc => sc.subCourseId === subCourseId);
                        
                        if (subCourse && subCourse.presentationLink) {
                            setPresentationData(subCourse.presentationLink);
                            setSourceType(determineSourceType(subCourse.presentationLink));
                        } else {
                            console.error('No presentation link found for this sub-course');
                        }
                    } else {
                        console.error('Module or subCourses not found');
                    }
                } else {
                    console.error('Course does not exist');
                }
            } catch (error) {
                console.error('Error fetching presentation:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPresentation();
    }, [courseId, moduleTitle, subCourseId]);
    
    const determineSourceType = (link) => {
        if (link.includes("youtube.com") || link.includes("youtu.be")) {
            return "youtube";
        } else if (link.includes("docs.google.com/presentation")) {
            return "googleSlides";
        }
        return null;
    };

    const handleEvaluationClick = () => {
        navigate(`/courses/${courseId}/evaluation`);
    };

    return (
        <div
            className="presentation-page"
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                minHeight: '100vh',
                backgroundColor: '#f4f4f9',
            }}
        >
            <button onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>← Back to Courses</button>
            {loading ? (
                <div className="loading-indicator" style={{ textAlign: 'center', padding: '20px' }}>
                    <span>Loading presentation...</span>
                    <div
                        className="spinner"
                        style={{
                            margin: '20px auto',
                            width: '50px',
                            height: '50px',
                            border: '5px solid #f3f3f3',
                            borderRadius: '50%',
                            borderTop: '5px solid #3498db',
                            animation: 'spin 2s linear infinite',
                        }}
                    ></div>
                </div>
            ) : (
                presentationData ? (
                    <div
                        className="presentation-player"
                        style={{
                            width: '100%',
                            maxWidth: '1200px',
                            position: 'relative',
                            paddingTop: '56.25%',
                            backgroundColor: '#ffffff',
                            borderRadius: '10px',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                            overflow: 'hidden',
                            margin: '0 auto',
                        }}
                    >
                        <iframe
                            src={presentationData}
                            title="Presentation"
                            allowFullScreen
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                border: 'none',
                                borderRadius: '10px',
                            }}
                            allow={
                                sourceType === "youtube"
                                    ? "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    : ""
                            }
                        />
                    </div>
                ) : (
                    <div>
                        <p>No presentation available for this sub-course.</p>
                        <button onClick={() => navigate(-1)}>Return to Course</button>
                    </div>
                )
            )}
            <button
                className="evaluation-button"
                onClick={() => navigate(`/courses/${courseId}/exam?module=${moduleTitle}&subcourse=${subCourseId}`)}
                style={{
                    marginTop: '20px',
                    backgroundColor: 'rgb(130,88,18)',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s',
                }}
            >
                Take Evaluation
            </button>
        </div>
    );
}

export default CoursePresentation;