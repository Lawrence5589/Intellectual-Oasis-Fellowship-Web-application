import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, setDoc, query, getDocs, writeBatch, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../contexts/AuthContext';

const ScholarshipApplication = () => {
  const { scholarshipId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    institution: '',
    level: '',
    department: '',
    cgpa: '',
    documents: {},
    additionalInfo: ''
  });

  const defaultScholarships = [
    {
      id: 'fellow-scholarship',
      title: 'Become a Fellow Scholarship',
      type: 'fellow',
      eligibility: 'Nigerian University Students from 2nd level until penultimate year',
      benefits: [
        'Year tuition cost coverage',
        'Exam stipends',
        'Opportunity to become a mentor'
      ],
      requiredDocuments: [
        'Valid Student ID',
        'Academic Transcript',
        'Letter of Recommendation',
        'Statement of Purpose',
        'Passport Photograph'
      ]
    },
    {
      id: 'utme-scholarship',
      title: 'UTME Scholar Project',
      type: 'utme',
      eligibility: 'Students in Senior Secondary School',
      benefits: [
        'UTME fee coverage',
        'Post UTME fee coverage',
        'First year tuition fee coverage'
      ],
      requiredDocuments: [
        'WAEC/NECO Result',
        'School ID',
        'Letter of Recommendation',
        'Statement of Purpose',
        'Passport Photograph'
      ]
    },
    {
      id: 'orphan-scholarship',
      title: 'Orphan Project',
      type: 'orphan',
      eligibility: 'Orphaned children in Schools in need of financial Support',
      benefits: [
        'Tuition fee coverage',
        'Educational materials support',
        'Mentorship program access'
      ],
      requiredDocuments: [
        'Death Certificate(s) of Parent(s)',
        'Guardian\'s ID',
        'School ID',
        'Academic Records',
        'Letter of Recommendation',
        'Passport Photograph'
      ]
    }
  ];

  // Initialize form data with user info when available
  useEffect(() => {
    console.log('Current user state:', user);
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.displayName || user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  // Fetch scholarship data
  useEffect(() => {
    const abortController = new AbortController();
    let isMounted = true;

    const fetchScholarship = async () => {
      try {
        if (!scholarshipId) {
          console.error('No scholarship ID provided');
          setLoading(false);
          return;
        }

        setLoading(true);
        console.log('Starting scholarship fetch with ID:', scholarshipId);

        // First try to get the specific scholarship
        const scholarshipRef = doc(db, 'scholarships', scholarshipId);
        const scholarshipSnap = await getDoc(scholarshipRef);
        
        // Check if component is still mounted
        if (!isMounted) return;
        
        if (scholarshipSnap.exists()) {
          const data = scholarshipSnap.data();
          console.log('Found existing scholarship:', data);
          setScholarship({
            id: scholarshipSnap.id,
            ...data
          });
        } else {
          // If not found, try to get the base scholarship
          const baseScholarshipId = scholarshipId.split('_')[0];
          console.log('No specific scholarship found, using base ID:', baseScholarshipId);
          
          const baseScholarship = defaultScholarships.find(s => s.id === baseScholarshipId);
          
          if (!baseScholarship) {
            console.error('Base scholarship not found for ID:', baseScholarshipId);
            throw new Error('Scholarship not found');
          }

          // Create a new scholarship period
          const now = new Date();
          const startDate = new Date();
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + 3);

          const scholarshipData = {
            ...baseScholarship,
            id: scholarshipId,
            baseScholarshipId,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            createdAt: now.toISOString(),
            updatedAt: now.toISOString()
          };

          if (!isMounted) return;

          console.log('Creating new scholarship period:', scholarshipData);
          
          // Save the new scholarship
          await setDoc(scholarshipRef, scholarshipData);
          setScholarship(scholarshipData);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Error in fetchScholarship:', error);
        setErrors(prev => ({
          ...prev,
          submit: 'Error loading scholarship: ' + error.message
        }));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchScholarship();

    // Cleanup function
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [scholarshipId]);

  const checkScholarshipDates = () => {
    if (!scholarship.startDate || !scholarship.endDate) {
      console.error('Scholarship dates not set:', { startDate: scholarship.startDate, endDate: scholarship.endDate });
      setErrors(prev => ({
        ...prev,
        submit: 'This scholarship is not currently accepting applications.'
      }));
      return false;
    }

    const now = new Date();
    const startDate = new Date(scholarship.startDate);
    const endDate = new Date(scholarship.endDate);

    if (now < startDate) {
      console.error('Scholarship not yet started:', { now, startDate });
      setErrors(prev => ({
        ...prev,
        submit: 'Applications for this scholarship are not yet open.'
      }));
      return false;
    }

    if (now > endDate) {
      console.error('Scholarship ended:', { now, endDate });
      setErrors(prev => ({
        ...prev,
        submit: 'Applications for this scholarship are closed.'
      }));
      return false;
    }

    return true;
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Institution validation
    if (!formData.institution.trim()) {
      newErrors.institution = 'Institution is required';
    }

    // Level validation
    if (!formData.level.trim()) {
      newErrors.level = 'Level is required';
    }

    // Department validation
    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }

    // CGPA validation
    if (!formData.cgpa) {
      newErrors.cgpa = 'CGPA is required';
    } else if (isNaN(formData.cgpa) || formData.cgpa < 0 || formData.cgpa > 5) {
      newErrors.cgpa = 'Please enter a valid CGPA between 0 and 5';
    }

    // Document validation - Make it stricter
    if (scholarship && scholarship.requiredDocuments) {
      scholarship.requiredDocuments.forEach(doc => {
        if (!formData.documents[doc]) {
          newErrors[`document_${doc}`] = `${doc} is required`;
        }
      });

      // Check if all required documents are uploaded
      const missingDocuments = scholarship.requiredDocuments.filter(
        doc => !formData.documents[doc]
      );

      if (missingDocuments.length > 0) {
        newErrors.documents = `Missing required documents: ${missingDocuments.join(', ')}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDocumentUpload = async (e, documentType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (300KB limit)
    if (file.size > 300 * 1024) {
      setErrors(prev => ({
        ...prev,
        [`document_${documentType}`]: 'File size must be less than 300KB'
      }));
      return;
    }

    // Check file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        [`document_${documentType}`]: 'File must be PDF, JPEG, or PNG'
      }));
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'ml_default');
      formData.append('folder', 'scholarships');
      
      // Generate a custom public_id based on document type and timestamp
      const timestamp = new Date().getTime();
      const publicId = `${scholarshipId}_${documentType.toLowerCase().replace(/\s+/g, '_')}_${timestamp}`;
      formData.append('public_id', publicId);

      // Determine the correct resource type and URL
      let uploadUrl;
      if (file.type.startsWith('image/')) {
        uploadUrl = 'https://api.cloudinary.com/v1_1/dkyoxq3cc/image/upload';
      } else {
        uploadUrl = 'https://api.cloudinary.com/v1_1/dkyoxq3cc/raw/upload';
        formData.append('resource_type', 'raw');
      }

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Cloudinary error details:', errorData);
        throw new Error(errorData.error?.message || 'Upload failed');
      }

      const data = await response.json();
      console.log('Upload successful:', data);
      
      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [documentType]: data.secure_url
        }
      }));

      // Clear error on successful upload
      setErrors(prev => ({
        ...prev,
        [`document_${documentType}`]: ''
      }));
    } catch (error) {
      console.error('Error uploading document:', error);
      setErrors(prev => ({
        ...prev,
        [`document_${documentType}`]: error.message || 'Failed to upload document. Please try again.'
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Starting form submission...');
    
    if (!user) {
      console.error('No user logged in');
      navigate('/login', { 
        state: { 
          from: location.pathname,
          message: 'Please log in to submit your application'
        }
      });
      return;
    }

    if (!checkScholarshipDates()) {
      return;
    }

    if (!validateForm()) {
      console.log('Form validation failed:', errors);
      const firstError = document.querySelector('.text-red-600');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    try {
      // Check if user has already applied for this scholarship
      const existingApplicationsRef = collection(db, 'scholarshipApplications');
      const existingApplicationsQuery = query(
        existingApplicationsRef, 
        where('userId', '==', user.uid),
        where('scholarshipId', '==', scholarshipId)
      );
      
      const existingApplicationsSnap = await getDocs(existingApplicationsQuery);
      
      if (!existingApplicationsSnap.empty) {
        setErrors(prev => ({
          ...prev,
          submit: 'You have already applied for this scholarship'
        }));
        return;
      }

      console.log('Creating application with data:', { scholarshipId, user, formData });
      
      // Create a unique application ID
      const applicationId = `${scholarshipId}_${user.uid}_${Date.now()}`;
      
      const applicationData = {
        id: applicationId,
        userId: user.uid,
        scholarshipId,
        baseScholarshipId: scholarship.baseScholarshipId || scholarshipId.split('_')[0],
        scholarshipTitle: scholarship.title,
        scholarshipType: scholarship.type,
        status: 'pending',
        phase: 'document_review',
        appliedAt: new Date().toISOString(),
        applicantName: user.displayName || user.name || formData.fullName,
        applicantEmail: user.email || formData.email,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        institution: formData.institution,
        level: formData.level,
        department: formData.department,
        cgpa: formData.cgpa,
        documents: formData.documents,
        additionalInfo: formData.additionalInfo,
        reviewNotes: '',
        quizScore: null,
        quizCompletedAt: null,
        lastUpdated: new Date().toISOString()
      };

      console.log('Saving application data:', applicationData);

      const batch = writeBatch(db);

      // Store in scholarship's applications subcollection
      const scholarshipApplicationRef = doc(db, 'scholarships', scholarshipId, 'applications', applicationId);
      batch.set(scholarshipApplicationRef, applicationData);

      // Store in user's applications collection
      const userApplicationRef = doc(db, 'users', user.uid, 'applications', applicationId);
      batch.set(userApplicationRef, applicationData);

      // Store in main applications collection
      const mainApplicationRef = doc(db, 'scholarshipApplications', applicationId);
      batch.set(mainApplicationRef, applicationData);

      await batch.commit();
      console.log('All application data saved successfully');

      navigate('/scholarships/application-success', { 
        replace: true,
        state: { 
          scholarshipTitle: scholarship.title,
          applicationId: applicationId
        }
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      setErrors(prev => ({
        ...prev,
        submit: `Failed to submit application: ${error.message}`
      }));
    }
  };

  // Loading state check
  if (loading) {
    console.log('Component is in loading state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[rgb(130,88,18)]"></div>
      </div>
    );
  }

  // Authentication check
  if (!user) {
    console.log('No user found in auth context');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to apply for scholarships.</p>
          <button
            onClick={() => navigate('/login', { 
              state: { 
                from: location.pathname,
                message: 'Please log in to apply for scholarships'
              }
            })}
            className="bg-[rgb(130,88,18)] text-white py-2 px-4 rounded-md hover:bg-[rgb(110,75,15)] transition-colors duration-300"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  // Scholarship check
  if (!scholarship) {
    console.log('No scholarship data found');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Scholarship Not Found</h2>
          <p className="text-gray-600 mb-4">The scholarship you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/scholarships')}
            className="bg-[rgb(130,88,18)] text-white py-2 px-4 rounded-md hover:bg-[rgb(110,75,15)] transition-colors duration-300"
          >
            Return to Scholarships
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Apply for {scholarship.title}</h1>
      
      {errors.documents && (
        <div className="mb-6 p-4 bg-red-50 border border-red-400 rounded-md">
          <p className="text-red-600">{errors.documents}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            required
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors.fullName ? 'border-red-500' : 'border-gray-300'
            } focus:border-[rgb(130,88,18)] focus:ring-[rgb(130,88,18)]`}
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            } focus:border-[rgb(130,88,18)] focus:ring-[rgb(130,88,18)]`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            } focus:border-[rgb(130,88,18)] focus:ring-[rgb(130,88,18)]`}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Institution</label>
          <input
            type="text"
            name="institution"
            value={formData.institution}
            onChange={handleInputChange}
            required
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors.institution ? 'border-red-500' : 'border-gray-300'
            } focus:border-[rgb(130,88,18)] focus:ring-[rgb(130,88,18)]`}
          />
          {errors.institution && (
            <p className="mt-1 text-sm text-red-600">{errors.institution}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Level</label>
          <input
            type="text"
            name="level"
            value={formData.level}
            onChange={handleInputChange}
            required
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors.level ? 'border-red-500' : 'border-gray-300'
            } focus:border-[rgb(130,88,18)] focus:ring-[rgb(130,88,18)]`}
          />
          {errors.level && (
            <p className="mt-1 text-sm text-red-600">{errors.level}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Department</label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleInputChange}
            required
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors.department ? 'border-red-500' : 'border-gray-300'
            } focus:border-[rgb(130,88,18)] focus:ring-[rgb(130,88,18)]`}
          />
          {errors.department && (
            <p className="mt-1 text-sm text-red-600">{errors.department}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">CGPA</label>
          <input
            type="text"
            name="cgpa"
            value={formData.cgpa}
            onChange={handleInputChange}
            required
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors.cgpa ? 'border-red-500' : 'border-gray-300'
            } focus:border-[rgb(130,88,18)] focus:ring-[rgb(130,88,18)]`}
          />
          {errors.cgpa && (
            <p className="mt-1 text-sm text-red-600">{errors.cgpa}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Additional Information</label>
          <textarea
            name="additionalInfo"
            value={formData.additionalInfo}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md shadow-sm ${
              errors.additionalInfo ? 'border-red-500' : 'border-gray-300'
            } focus:border-[rgb(130,88,18)] focus:ring-[rgb(130,88,18)]`}
          />
          {errors.additionalInfo && (
            <p className="mt-1 text-sm text-red-600">{errors.additionalInfo}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Documents</label>
          {scholarship.requiredDocuments.map(doc => (
            <div key={doc} className="mt-2">
              <label className="block text-sm font-medium text-gray-700">{doc}</label>
              <input
                type="file"
                onChange={(e) => handleDocumentUpload(e, doc)}
                className="mt-1 block w-full rounded-md shadow-sm border-gray-300 focus:border-[rgb(130,88,18)] focus:ring-[rgb(130,88,18)]"
              />
              {errors[`document_${doc}`] && (
                <p className="mt-1 text-sm text-red-600">{errors[`document_${doc}`]}</p>
              )}
            </div>
          ))}
        </div>

        {errors.submit && (
          <p className="text-sm text-red-600">{errors.submit}</p>
        )}

        <button
          type="submit"
          className="w-full bg-[rgb(130,88,18)] text-white py-2 px-4 rounded-md hover:bg-[rgb(110,75,15)] transition-colors duration-300"
        >
          Submit Application
        </button>
      </form>
    </div>
  );
};

export default ScholarshipApplication;