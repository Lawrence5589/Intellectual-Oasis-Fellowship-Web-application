// LoadingIndicator.js
import React from 'react';

const LoadingIndicator = () => {
    return (
        <div
            className="flex items-center justify-center p-6"
            style={{ minHeight: '100vh' }}
        >
            <div className="text-center">
                <span className="block mb-4 text-lg font-semibold">Loading...</span>
                <div
                    className="spinner"
                    style={{
                        margin: '0 auto',
                        width: '50px',
                        height: '50px',
                        border: '5px solid #f3f3f3',
                        borderRadius: '50%',
                        borderTop: '5px solid #3498db',
                        animation: 'spin 2s linear infinite',
                    }}
                ></div>
            </div>
        </div>
    );
};

export default LoadingIndicator;