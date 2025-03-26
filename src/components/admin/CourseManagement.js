import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase';
import { collection, doc, getDocs, getDoc, addDoc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import LoadingIndicator from '../common/LoadingIndicator';

function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [courseName, setCourseName] = useState('');
  const [moduleData, setModuleData] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const coursesPerPage = 6;
  const [expandedCourses, setExpandedCourses] = useState({});
  const fileInputRefs = useRef({});
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    type: '',
    image: '',
    modules: 0,
    status: 'available',
    category: '',
    duration: '',
    rating: '0.0',
    prerequisites: '',
    learningObjectives: '',
    targetAudience: '',
    difficulty: 'beginner'
  });

  // New states for editing
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({});

  // Predefined categories, types, statuses, and difficulty levels
  const courseCategories = ['Arts and Humanities', 'Biology and Health', 'Business', 'Information Technology', 'Language Learning', 'Personal Development', 'Social Sciences', 'Teaching and Academics'];
  const courseTypes = [{ value: 'certification', label: 'Certification Course' }, { value: 'non-certification', label: 'Free Course' }];
  const courseStatuses = [{ value: 'available', label: 'Available' }, { value: 'coming_soon', label: 'Coming Soon' }, { value: 'archived', label: 'Archived' }, { value: 'enrolled', label: 'Enrolled' }, { value: 'completed', label: 'Completed' }];
  const difficultyLevels = [{ value: 'beginner', label: 'Beginner' }, { value: 'intermediate', label: 'Intermediate' }, { value: 'advanced', label: 'Advanced' }];

  const fetchCourses = async () => {
    try {
      const coursesCol = collection(db, 'courses');
      const coursesSnapshot = await getDocs(coursesCol);
      const coursesList = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        modules: Array.isArray(doc.data().modules) ? doc.data().modules : []
      }));
      setCourses(coursesList);
      setModuleData(prevModuleData => {
        const initialModuleData = {};
        coursesList.forEach(course => {
          course.modules.forEach(module => {
            if (!initialModuleData[course.id]) initialModuleData[course.id] = {};
            initialModuleData[course.id][module.moduleId] = {
              moduleId: module.moduleId,
              subCourses: module.subCourses || [],
              ...prevModuleData[course.id]?.[module.moduleId],
            };
          });
        });
        return initialModuleData;
      });
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const deleteSubCourse = async (courseId, moduleId, subCourseId) => {
    try {
      const courseRef = doc(db, 'courses', courseId);
      const courseDoc = await getDoc(courseRef);
      const courseData = courseDoc.data();
      const updatedModules = courseData.modules.map(module => {
        if (module.moduleId === moduleId) {
          return {
            ...module,
            subCourses: module.subCourses.filter(sub => sub.subCourseId !== subCourseId)
          };
        }
        return module;
      });
      await updateDoc(courseRef, { modules: updatedModules, lastUpdated: serverTimestamp() });
      fetchCourses();
    } catch (error) {
      console.error("Error deleting sub-course:", error);
    }
  };

  const toggleEdit = (courseId, moduleId, subCourse) => {
    setEditing({ courseId, moduleId, subCourseId: subCourse.subCourseId });
    setEditData({ ...subCourse });
  };

  const handleEditChange = (e, field) => {
    if (field === 'quizData') {
      // Don't set the File object directly
      return;
    }
    setEditData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      setUploadError("Please upload a JSON file");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const quizData = JSON.parse(evt.target.result);
          
          // Validate quiz data structure
          if (!quizData.questions || !Array.isArray(quizData.questions)) {
            throw new Error("Invalid quiz format. Must contain questions array.");
          }

          setEditData(prev => ({ ...prev, quizData: quizData }));
        } catch (error) {
          console.error("Error processing quiz file:", error);
          setUploadError(`Failed to process the quiz file: ${error.message}`);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error("Error reading file:", error);
      setUploadError(`Failed to read the file: ${error.message}`);
    }
  };

  const saveEdit = async (courseId, moduleId) => {
    try {
      const courseRef = doc(db, 'courses', courseId);
      const courseData = (await getDoc(courseRef)).data();
      const updatedModules = courseData.modules.map(module => {
        if (module.moduleId === moduleId) {
          return {
            ...module,
            subCourses: module.subCourses.map(sub =>
              sub.subCourseId === editing.subCourseId 
                ? {
                    ...sub,
                    title: editData.title,
                    description: editData.description,
                    presentationLink: editData.presentationLink,
                    quizData: editData.quizData || sub.quizData // Preserve existing quizData if no new file
                  }
                : sub
            )
          };
        }
        return module;
      });

      await updateDoc(courseRef, { 
        modules: updatedModules,
        lastUpdated: serverTimestamp()
      });

      setEditing(null);
      setUploadSuccess("Changes saved successfully!");
      fetchCourses();
    } catch (error) {
      console.error("Error saving edit:", error);
      setUploadError("Failed to save changes. Please try again.");
    }
  };

  /*const handleNewCourseChange = (e) => {
    const { name, value } = e.target;
    setNewCourse(prev => ({
      ...prev,
      [name]: value
    }));
  };*/

  const addCourse = async () => {
    if (!newCourse.title || !newCourse.category) {
      setUploadError("Course title and category are required.");
      return;
    }

    setLoading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      await addDoc(collection(db, 'courses'), {
        ...newCourse,
        createdAt: serverTimestamp(),
        modules: Number(newCourse.modules) || 0,
        rating: Number(newCourse.rating) || 0.0,
      });

      setNewCourse({
        title: '',
        description: '',
        type: '',
        image: '',
        modules: 0,
        status: 'available',
        category: '',
        duration: '',
        rating: '0.0',
        prerequisites: '',
        learningObjectives: '',
        targetAudience: '',
        difficulty: 'beginner'
      });

      setUploadSuccess(true);
      fetchCourses();
    } catch (error) {
      console.error("Error adding course:", error);
      setUploadError("Failed to add the course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (courseId) => {
    try {
      await deleteDoc(doc(db, 'courses', courseId));
      setCourses(courses.filter(course => course.id !== courseId));
      setUploadSuccess("Course deleted successfully!");
    } catch (error) {
      console.error("Error deleting course:", error);
      setUploadError("Failed to delete the course. Please try again.");
    }
  };

  const handleInputChange = (e, courseId, field) => {
    setModuleData(prev => ({
      ...prev,
      [courseId]: {
        ...prev[courseId],
        [field]: e.target.value
      }
    }));
  };

  const handleQuizUpload = async (e, courseId, moduleId, subCourseId) => {
    setUploadError(null);
    setUploadSuccess(false);
    const file = e.target.files[0];
    
    if (!file) {
      setUploadError("Please select a file.");
      return;
    }

    if (file.type !== 'application/json') {
      setUploadError("Please upload a JSON file");
      return;
    }

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const quizData = JSON.parse(evt.target.result);
          
          // Validate quiz data structure
          if (!quizData.questions || !Array.isArray(quizData.questions)) {
            throw new Error("Invalid quiz format. Must contain questions array.");
          }

          // Update the specific subcourse with quiz data
          const courseRef = doc(db, 'courses', courseId);
          const courseDoc = await getDoc(courseRef);
          
          if (courseDoc.exists()) {
            const courseData = courseDoc.data();
            const updatedModules = courseData.modules.map(module => {
              if (module.moduleId === moduleId) {
                return {
                  ...module,
                  subCourses: module.subCourses.map(subCourse => {
                    if (subCourse.subCourseId === subCourseId) {
                      return {
                        ...subCourse,
                        quizData: quizData
                      };
                    }
                    return subCourse;
                  })
                };
              }
              return module;
            });

            await updateDoc(courseRef, { 
              modules: updatedModules,
              lastUpdated: serverTimestamp()
            });

            setUploadSuccess("Quiz uploaded successfully!");
            fetchCourses(); // Refresh the course list
          }
        } catch (error) {
          console.error("Error processing quiz file:", error);
          setUploadError(`Failed to process the quiz file: ${error.message}`);
        }
        setLoading(false);
      };

      reader.readAsText(file);
    } catch (error) {
      console.error("Error processing file:", error);
      setUploadError(`Failed to process the file: ${error.message}`);
      setLoading(false);
    }
  };

  const handleNewCourseChange = (e) => {
    const { name, value } = e.target;
    setNewCourse(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const addSubCourse = async (courseId) => {
    const moduleInfo = moduleData[courseId];
  
    // Ensure required fields are provided
    if (!moduleInfo.moduleId || !moduleInfo.subCourseId || !moduleInfo.title) {
      setUploadError("Please fill in all required fields (Module ID, Sub-course ID, and Title)");
      return;
    }
  
    setLoading(true);
    setUploadError(null);
    setUploadSuccess(false);
  
    try {
      const courseRef = doc(db, 'courses', courseId);
      const courseDoc = await getDoc(courseRef);
  
      if (!courseDoc.exists()) {
        throw new Error("Course not found");
      }
  
      const courseData = courseDoc.data();
      let modules = courseData.modules || [];
  
      if (typeof modules === 'number') {
        modules = [];
      }
  
      let moduleIndex = modules.findIndex(m => m.moduleId === moduleInfo.moduleId);
      const currentTime = new Date().toISOString();
  
      if (moduleIndex === -1) {
        modules.push({
          moduleId: moduleInfo.moduleId,
          createdAt: currentTime,
          subCourses: []
        });
        moduleIndex = modules.length - 1;
      }
  
      const subCourseExists = modules[moduleIndex].subCourses?.some(
        sc => sc.subCourseId === moduleInfo.subCourseId
      );
  
      if (subCourseExists) {
        throw new Error("Sub-course ID already exists in this module");
      }
  
      const newSubCourse = {
        subCourseId: moduleInfo.subCourseId,
        title: moduleInfo.title,
        description: moduleInfo.description || '',
        presentationLink: moduleInfo.presentationLink || '',
        quizData: moduleInfo.quizData || null,
        createdAt: currentTime
      };
  
      if (!modules[moduleIndex].subCourses) {
        modules[moduleIndex].subCourses = [];
      }
  
      modules[moduleIndex].subCourses.push(newSubCourse);
  
      await updateDoc(courseRef, {
        modules: modules,
        lastUpdated: serverTimestamp()
      });
  
      setModuleData(prev => ({
        ...prev,
        [courseId]: {
          courseId: courseId,
          moduleId: '',
          subCourseId: '',
          title: '',
          description: '',
          presentationLink: '',
          quizData: null
        }
      }));
  
      if (fileInputRefs.current[courseId]) {
        fileInputRefs.current[courseId].value = '';
      }
  
      setUploadSuccess("Sub-course added successfully!");
      await fetchCourses();
    } catch (error) {
      console.error("Error adding sub-course:", error);
      setUploadError(`Failed to add the sub-course: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
    setCurrentPage(1);
  };

  const filteredCourses = courses.filter(course =>
    course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lastCourseIndex = currentPage * coursesPerPage;
  const firstCourseIndex = lastCourseIndex - coursesPerPage;
  const currentCourses = filteredCourses.slice(firstCourseIndex, lastCourseIndex);
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  const changePage = (direction) => {
    if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const toggleCourseExpansion = (courseId) => {
    setExpandedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  const updateCourseStatus = async (courseId, newStatus) => {
    try {
      const courseRef = doc(db, 'courses', courseId);
      await updateDoc(courseRef, { 
        status: newStatus,
        lastUpdated: serverTimestamp()
      });
      setUploadSuccess("Course status updated successfully!");
      fetchCourses();
    } catch (error) {
      console.error("Error updating course status:", error);
      setUploadError("Failed to update course status. Please try again.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Course Management</h2>

      {loading ? (
        <LoadingIndicator />
      ) : (
        <>
          {/* Add New Course Form */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Add New Course</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={newCourse.title}
                    onChange={handleNewCourseChange}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[rgb(130,88,18)]"
                    placeholder="Enter course title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    name="category"
                    value={newCourse.category}
                    onChange={handleNewCourseChange}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[rgb(130,88,18)]"
                    required
                  >
                    <option value="">Select a category</option>
                    {courseCategories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Type</label>
                  <select
                    name="type"
                    value={newCourse.type}
                    onChange={handleNewCourseChange}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[rgb(130,88,18)]"
                  >
                    {courseTypes.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={newCourse.status}
                    onChange={handleNewCourseChange}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[rgb(130,88,18)]"
                  >
                    {courseStatuses.map((status) => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Modules</label>
                  <input
                    type="number"
                    name="modules"
                    value={newCourse.modules}
                    onChange={handleNewCourseChange}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[rgb(130,88,18)]"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={newCourse.duration}
                    onChange={handleNewCourseChange}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[rgb(130,88,18)]"
                    placeholder="e.g., 2 hours"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
                  <select
                    name="difficulty"
                    value={newCourse.difficulty}
                    onChange={handleNewCourseChange}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[rgb(130,88,18)]"
                  >
                    {difficultyLevels.map((level) => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="text"
                    name="image"
                    value={newCourse.image}
                    onChange={handleNewCourseChange}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[rgb(130,88,18)]"
                    placeholder="Enter image URL"
                  />
                </div>
              </div>
            </div>

            {/* Full Width Fields */}
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={newCourse.description}
                  onChange={handleNewCourseChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[rgb(130,88,18)]"
                  rows="3"
                  placeholder="Enter course description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prerequisites</label>
                <textarea name="prerequisites"
                  value={newCourse.prerequisites}
                  onChange={handleNewCourseChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[rgb(130,88,18)]"
                  rows="2"
                  placeholder="Enter course prerequisites"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Learning Objectives</label>
                <textarea
                  name="learningObjectives"
                  value={newCourse.learningObjectives}
                  onChange={handleNewCourseChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[rgb(130,88,18)]"
                  rows="2"
                  placeholder="Enter learning objectives"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                <textarea
                  name="targetAudience"
                  value={newCourse.targetAudience}
                  onChange={handleNewCourseChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[rgb(130,88,18)]"
                  rows="2"
                  placeholder="Describe the target audience"
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={addCourse}
                disabled={loading}
                className="w-full bg-[rgb(130,88,18)] text-white py-3 px-4 rounded-md hover:bg-[rgb(110,68,0)] transition-colors disabled:opacity-50"
              >
                {loading ? 'Adding Course...' : 'Add Course'}
              </button>

              {uploadError && (
                <p className="mt-2 text-red-600">{uploadError}</p>
              )}
              {uploadSuccess && (
                <p className="mt-2 text-green-600">Course added successfully!</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <input
              type="text"
              value={courseName}
              onChange={e => setCourseName(e.target.value)}
              placeholder="New Course Name"
              className="border p-2 rounded w-full mb-3"
            />

            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search Courses"
              className="border p-2 rounded w-full mb-3"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentCourses.map(course => (
              <div key={course.id} className="bg-white rounded-lg shadow-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">{course.title}</h3>
                  <div>
                    <select
                      value={course.status || 'available'}
                      onChange={(e) => updateCourseStatus(course.id, e.target.value)}
                      className="mr-4 p-2 border rounded-md focus:ring-2 focus:ring-[rgb(130,88,18)]"
                    >
                      {courseStatuses.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => toggleCourseExpansion(course.id)}
                      className="text-blue-600 hover:text-blue-800 mr-4"
                    >
                      {expandedCourses[course.id] ? 'Hide Details' : 'Show Details'}
                    </button>

                    <button
                      onClick={() => deleteCourse(course.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete Course
                    </button>
                  </div>
                </div>

                {expandedCourses[course.id] && (
                  <div className="mt-4">
                    {course.modules.map(module => (
                      <div key={module.moduleId} className="mb-2">
                        <h4 className="text-lg font-medium">Module {module.moduleId}</h4>
                        {module.subCourses.map(subCourse => (
                          <div key={subCourse.subCourseId} className="mb-2 border-b pb-2">
                            {editing && editing.courseId === course.id && editing.moduleId === module.moduleId && editing.subCourseId === subCourse.subCourseId ? (
                              <>
                                <input
                                  type="text"
                                  value={editData.title || ''}
                                  onChange={(e) => handleEditChange(e, 'title')}
                                  className="w-full p-2 border rounded-md mb-2"
                                  placeholder="Title"
                                />
                                <textarea
                                  value={editData.description || ''}
                                  onChange={(e) => handleEditChange(e, 'description')}
                                  className="w-full p-2 border rounded-md mb-2"
                                  placeholder="Description"
                                />
                                <input
                                  type="text"
                                  value={editData.presentationLink || ''}
                                  onChange={(e) => handleEditChange(e, 'presentationLink')}
                                  className="w-full p-2 border rounded-md mb-2"
                                  placeholder="Presentation Link"
                                />
                                <div className="mb-2">
                                  <p className="text-sm mb-1">Current Quiz Status: {editData.quizData ? 'Available' : 'Not Available'}</p>
                                  <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleFileChange}
                                    className="w-full mb-2"
                                  />
                                </div>
                                {uploadError && <p className="text-red-500 text-sm mb-2">{uploadError}</p>}
                                {uploadSuccess && <p className="text-green-500 text-sm mb-2">{uploadSuccess}</p>}
                                <button
                                  onClick={() => saveEdit(course.id, module.moduleId)}
                                  className="bg-[rgb(130,88,18)] text-white py-2 px-4 rounded-md hover:bg-[rgb(110,68,0)] transition-colors mr-2"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditing(null);
                                    setUploadError(null);
                                    setUploadSuccess(false);
                                  }}
                                  className="bg-gray-400 text-white py-2 px-4 rounded-md hover:bg-gray-500 transition-colors"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <h5 className="font-semibold">{subCourse.title}</h5>
                                <p>ID: {subCourse.subCourseId}</p>
                                {subCourse.description && <p>Description: {subCourse.description}</p>}
                                
                                {/* Add Quiz Status Display */}
                                <div className="mt-2 mb-2">
                                  <p className={`text-sm ${subCourse.quizData ? 'text-green-600' : 'text-red-600'}`}>
                                    Quiz Status: {subCourse.quizData ? 'Available' : 'Not Available'}
                                  </p>
                                </div>

                                {/* Add Quiz Upload Section */}
                                {!subCourse.quizData && (
                                  <div className="mt-2 mb-2">
                                    <input
                                      type="file"
                                      accept=".json"
                                      onChange={(e) => handleQuizUpload(e, course.id, module.moduleId, subCourse.subCourseId)}
                                      className="mb-2"
                                    />
                                  </div>
                                )}

                                <button
                                  onClick={() => toggleEdit(course.id, module.moduleId, subCourse)}
                                  className="bg-[rgb(130,88,18)] text-white py-2 px-4 rounded-md hover:bg-[rgb(110,68,0)] transition-colors mr-2"
                                >
                                  Edit
                                </button>

                                <button
                                  onClick={() => deleteSubCourse(course.id, module.moduleId, subCourse.subCourseId)}
                                  className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                    <h4 className="text-lg font-medium mb-3">Add New Sub-course:</h4>
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={moduleData[course.id]?.moduleId || ''}
                        onChange={(e) => handleInputChange(e, course.id, 'moduleId')}
                        placeholder="Module ID"
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[rgb(130,88,18)]"
                      />
                      <input
                        type="text"
                        value={moduleData[course.id]?.subCourseId || ''}
                        onChange={(e) => handleInputChange(e, course.id, 'subCourseId')}
                        placeholder="Sub-course ID"
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[rgb(130,88,18)]"
                      />
                      <input
                        type="text"
                        value={moduleData[course.id]?.title || ''}
                        onChange={(e) => handleInputChange(e, course.id, 'title')}
                        placeholder="Sub-course Title"
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[rgb(130,88,18)]"
                      />
                      <textarea
                        value={moduleData[course.id]?.description || ''}
                        onChange={(e) => handleInputChange(e, course.id, 'description')}
                        placeholder="Sub-course Description"
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[rgb(130,88,18)]"
                        rows="3"
                      />
                      <input
                        type="text"
                        value={moduleData[course.id]?.presentationLink || ''}
                        onChange={(e) => handleInputChange(e, course.id, 'presentationLink')}
                        placeholder="Presentation Link"
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[rgb(130,88,18)]"
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quiz File (JSON format only)
                        </label>
                        <input
                          type="file"
                          accept=".json"
                          onChange={(e) => handleQuizUpload(e, course.id, moduleData[course.id]?.moduleId, moduleData[course.id]?.subCourseId)}
                          ref={el => fileInputRefs.current[course.id] = el}
                          className="w-full"
                        />
                      </div>
                      <button
                        onClick={() => addSubCourse(course.id)}
                        className="w-full bg-[rgb(130,88,18)] text-white py-2 px-4 rounded-md hover:bg-[rgb(110,68,0)] transition-colors"
                      >
                        Add Sub-course
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-6">
            <button onClick={() => changePage('prev')} className="bg-gray-300 text-black py-1 px-3 rounded hover:bg-gray-400" disabled={currentPage === 1}>Previous</button>
            <p>Page {currentPage} of {totalPages}</p>
            <button onClick={() => changePage('next')} className="bg-gray-300 text-black py-1 px-3 rounded hover:bg-gray-400" disabled={currentPage === totalPages}>Next</button>
          </div>
        </>
      )}

      {uploadError && (
        <div className="text-red-500 mt-4">{uploadError}</div>
      )}
      
      {uploadSuccess && (
        <div className="text-green-500 mt-4">Upload successful!</div>
      )}
    </div>
  );
}

export default CourseManagement;