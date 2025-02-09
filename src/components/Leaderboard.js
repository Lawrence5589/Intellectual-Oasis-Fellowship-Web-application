import React from 'react';

function Leaderboard({ data }) {
  return (
    <section id="leaderboard" className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Leaderboard</h2>
      <ul>
        {data.map((entry, index) => (
          <li key={index} className="mb-2">
            {entry.user} - {entry.score}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Leaderboard;