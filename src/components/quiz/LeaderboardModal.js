import React from 'react';
import { FiX, FiStar, FiClock } from 'react-icons/fi';

function LeaderboardModal({ isOpen, onClose, leaderboard, currentUserId }) {
  if (!isOpen) return null;

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg p-3 sm:p-6 max-w-2xl w-full mx-2 sm:mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold flex items-center">
            <FiStar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-[rgb(130,88,18)]" />
            Top Performers
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="space-y-2 sm:space-y-3">
          {leaderboard.length === 0 ? (
            <div className="text-center py-4 text-gray-500 text-sm sm:text-base">
              No entries in leaderboard yet
            </div>
          ) : (
            leaderboard.map((entry, index) => (
              <div 
                key={entry.id}
                className={`flex items-center p-2 sm:p-4 rounded-lg ${
                  entry.userId === currentUserId ? 'bg-[rgb(130,88,18)] bg-opacity-10' : 'bg-gray-50'
                }`}
              >
                <div className="flex-shrink-0 w-6 sm:w-8 text-center font-bold text-[rgb(130,88,18)] text-sm sm:text-base">
                  #{index + 1}
                </div>
                <div className="flex-grow ml-2 sm:ml-4">
                  <div className="font-semibold text-sm sm:text-base truncate">{entry.fullName}</div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    <FiClock className="inline-block w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {formatTime(entry.timeTaken)}
                  </div>
                </div>
                <div className={`flex-shrink-0 font-bold text-sm sm:text-base ${getScoreColor(entry.score)}`}>
                  {entry.score}%
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 sm:mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-base bg-gray-200 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default LeaderboardModal; 