import React from 'react';

const MobileWarning: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="mx-4 rounded-lg bg-white p-6 text-center shadow-xl">
        <div className="mb-4 text-yellow-500">
          <svg
            className="mx-auto h-12 w-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          Desktop Experience Recommended
        </h3>
        <p className="text-sm text-gray-600">
          For the best experience, please view this page on a desktop browser.
        </p>
      </div>
    </div>
  );
};

export default MobileWarning; 