import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../contexts/AuthContext';
import LoadingIndicator from '../common/LoadingIndicator';
import { v4 as uuidv4 } from 'uuid';

// Dynamically import html2canvas and jsPDF
const html2canvas = import('html2canvas').then(module => module.default);
const jsPDF = import('jspdf').then(module => module.default);

function Certificate() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState(null);
  const [completionData, setCompletionData] = useState(null);
  const [verificationId, setVerificationId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificateData = async () => {
      if (!user || !courseId) {
        console.log('Missing user or courseId:', { user, courseId });
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching certificate data for:', { userId: user.uid, courseId });
        
        // Verify course completion
        const completedRef = doc(db, 'users', user.uid, 'completedSubCourses', courseId);
        const completedDoc = await getDoc(completedRef);

        if (!completedDoc.exists()) {
          console.log('Course completion document not found');
          alert('Course must be completed to view certificate');
          navigate(`/courses/${courseId}`);
          return;
        }

        // Fetch course details
        const courseRef = doc(db, 'courses', courseId);
        const courseDoc = await getDoc(courseRef);

        if (!courseDoc.exists()) {
          console.log('Course document not found');
          throw new Error('Course not found');
        }

        const courseData = courseDoc.data();
        const completionData = completedDoc.data();

        console.log('Retrieved data:', { courseData, completionData });

        // Get completion timestamp, fallback to current time if not available
        const completionTimestamp = completionData.firstCompletedAt || 
                                  completionData.completedAt || 
                                  new Date().toISOString();

        // Check for existing certificate by courseId and userId
        const certificatesRef = collection(db, 'certificates');
        const q = query(
          certificatesRef, 
          where('courseId', '==', courseId),
          where('userId', '==', user.uid)
        );
        const existingCerts = await getDocs(q);
        let certVerificationId;

        if (!existingCerts.empty) {
          // Use existing certificate
          const existingCert = existingCerts.docs[0];
          certVerificationId = existingCert.data().verificationId;
          console.log('Using existing certificate:', certVerificationId);
        } else {
          // Create new certificate only if one doesn't exist
          certVerificationId = `IOF-${uuidv4().substring(0, 8).toUpperCase()}`;
          console.log('Generated new verification ID:', certVerificationId);

          // Create certificate data
          const certificateData = {
            userId: user.uid,
            userName: user.displayName || user.email,
            courseId: courseId,
            courseName: courseData.title,
            completedAt: completionTimestamp,
            generatedAt: new Date().toISOString(),
            verificationId: certVerificationId
          };

          console.log('Creating new certificate with data:', certificateData);

          // Store verification ID in user's completed courses
          await setDoc(completedRef, {
            ...completionData,
            verificationId: certVerificationId,
            certificateGeneratedAt: new Date().toISOString(),
            firstCompletedAt: completionTimestamp
          }, { merge: true });

          // Store certificate in certificates collection
          const certificateRef = doc(db, 'certificates', certVerificationId);
          await setDoc(certificateRef, certificateData);
          
          console.log('Certificate created successfully');
        }

        // Update state
        setCourseData(courseData);
        setCompletionData({
          ...completionData,
          firstCompletedAt: completionTimestamp
        });
        setVerificationId(certVerificationId);
        
        console.log('Certificate data fetched and processed successfully');
      } catch (error) {
        console.error('Detailed error in fetchCertificateData:', {
          error,
          errorMessage: error.message,
          errorCode: error.code,
          errorStack: error.stack
        });
        alert(`Error loading certificate: ${error.message}`);
        navigate('/courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificateData();
  }, [courseId, user, navigate]);

  const handleDownload = async () => {
    try {
      const certificate = document.getElementById('certificate');
      const h2c = await html2canvas;
      const PDF = await jsPDF;

      // Make certificate visible for capture
      const originalDisplay = certificate.style.display;
      certificate.style.display = 'block';

      // Simple configuration for html2canvas
      const canvas = await h2c(certificate, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        removeContainer: true,
        foreignObjectRendering: false // Disable foreign object rendering
      });

      // Restore original display
      certificate.style.display = originalDisplay;

      // Create PDF
      const pdf = new PDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1056, 747]
      });

      // Add image to PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, 1056, 747);
      
      // Save PDF
      pdf.save(`${courseData?.title || 'Certificate'}.pdf`);

    } catch (error) {
      console.error('Detailed download error:', error);
      alert('Failed to download certificate. Please try again.');
    }
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 flex flex-col items-center">
      <div className="w-full max-w-[1200px] mx-auto">
        {/* Download Button */}
        <div className="mb-4 sm:mb-6 text-center">
          <button
            onClick={handleDownload}
            className="bg-[rgb(130,88,18)] text-white px-6 py-3 rounded-full hover:bg-[rgb(110,68,0)] transition-colors flex items-center justify-center gap-2 mx-auto text-base"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Certificate
          </button>
        </div>

        {/* Mobile Message */}
        <div className="block sm:hidden text-center text-gray-600 text-sm mb-4">
          Please download the certificate to view it in full resolution.
        </div>

        {/* Certificate Container - Hidden on Mobile */}
        <div 
          id="certificate"
          className="hidden sm:block bg-white relative mx-auto"
          style={{ 
            width: '1056px',
            height: '747px',
            padding: '40px 60px',
            border: '2px solid rgb(130,88,18)',
            backgroundColor: '#ffffff',
            position: 'relative',
            margin: '0 auto',
            transformOrigin: 'top center',
          }}
        >
          {/* IOF Logo */}
          <img 
            src="/images/Group 4.jpg"
            alt="IOF Logo" 
            style={{
              position: 'absolute',
              top: '32px',
              left: '32px',
              width: '150px',
              height: 'auto',
              objectFit: 'contain',
              objectPosition: 'left top',
              display: 'block',
              zIndex: 10
            }}
            crossOrigin="anonymous"
          />

          {/* Certificate Content */}
          <div className="h-full flex flex-col justify-center items-center">
            <div className="text-center mb-8">
              <div 
                style={{
                  border: '1px solid rgb(130,88,18)',
                  padding: '1rem 2rem',
                  backgroundColor: '#f9f9f9'
                }}
              >
                <h2 className="text-base font-serif text-gray-600">VERIFIED CERTIFICATE</h2>
                <div className="mt-0.5 text-sm" style={{ color: 'rgb(130,88,18)' }}>WITH DISTINCTION</div>
              </div>
            </div>

            <div className="text-center space-y-4 max-w-2xl">
              <div className="text-base text-gray-600">
                {completionData?.firstCompletedAt ? 
                  new Date(completionData.firstCompletedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) 
                  : new Date().toLocaleDateString()
                }
              </div>
              
              <h2 className="text-4xl font-serif text-gray-800">
                {user.displayName || user.email}
              </h2>
              
              <p className="text-lg text-gray-600">
                has successfully completed with distinction
              </p>
              
              <h3 className="text-3xl font-bold text-[rgb(130,88,18)]">
                {courseData?.title}
              </h3>
              
              <p className="text-base text-gray-600">
                an online course offered by Intellectual Oasis Fellowship
              </p>
            </div>

            <div className="flex justify-between items-end w-full mt-12">
              <div className="text-center">
                <div style={{ borderTop: '1px solid #333', width: '120px' }}></div>
                <p className="mt-1 text-sm font-medium text-gray-700">Olalekan L. Adeyinka</p>
                <p className="text-xs text-gray-600">Director</p>
                <p className="text-xs text-gray-600">Intellectual Oasis Fellowship</p>
              </div>

              <div className="text-center">
                <div className="w-[100px] aspect-square mb-2 mx-auto"> {/* Increased from 50px */}
                  <svg 
                    viewBox="0 0 100 100" 
                    style={{
                      width: '100%',
                      height: '100%',
                      color: 'rgb(130,88,18)',
                      border: '3px solid currentColor', // Increased border width
                      borderRadius: '50%',
                      padding: '8px' // Increased padding
                    }}
                  >
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3"/> {/* Increased stroke width */}
                    <text x="50" y="45" textAnchor="middle" fill="currentColor" fontSize="24" fontFamily="serif">IOF</text> {/* Increased font size */}
                    <text x="50" y="65" textAnchor="middle" fill="currentColor" fontSize="16" fontFamily="serif">Verified</text> {/* Increased font size */}
                  </svg>
                </div>
                <p className="text-xs text-gray-600">Verify at iofellowship.org/verify/{verificationId}</p>
                <p className="text-[10px] text-gray-500">Certificate ID: {verificationId}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Certificate; 