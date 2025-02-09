import React from 'react';

function Reports() {
  const handleGenerateReport = () => {
    alert('Report generated!');
  };

  return (
    <section id="reports" className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Reports</h2>
      <button
        onClick={handleGenerateReport}
        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
      >
        Generate Report
      </button>
    </section>
  );
}

export default Reports;