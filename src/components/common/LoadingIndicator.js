import React from 'react';

function LoadingIndicator() {
    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(130,88,18)]"></div>
        </div>
    );
}

export default LoadingIndicator;