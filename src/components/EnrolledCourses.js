import React from 'react';

function EnrolledCourses({ enrolledCourses }) {
  return (
    <section id="enrolled-courses" className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Enrolled Courses</h2>
      <ul>
        {enrolledCourses.map((course, index) => (
          <li key={index} className="mb-2">
            {course.name} - {course.completionStatus}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default EnrolledCourses;