import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register required components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Analytics() {
  const data = {
    labels: ['Course1', 'Course2', 'Course3'],
    datasets: [
      {
        label: '# of Enrollments',
        data: [12, 19, 3],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <section id="analytics" className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Analytics</h2>
      <div style={{ height: '400px' }}>
        <Bar data={data} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>
    </section>
  );
}

export default Analytics;