import React from "react";
import FlowNode from "./FlowNode";

const EditorPage = () => {
  return (
    <div className="h-screen w-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-4 py-2 flex items-center">
        <button className="text-gray-600 hover:text-gray-800 px-2 py-1 rounded flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Back
        </button>
        <div className="ml-4">
          <h1 className="text-lg font-semibold">Captcha Solver</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs">Beginner</span>
            <span>Create an AI agent to solve various types of captcha challenges</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel with Challenge and Demo */}
        <div className="w-[400px] border-r bg-white p-8 space-y-8 overflow-y-auto">
          {/* Recaptcha Challenge Box */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recaptcha Challenge</h2>
            <div className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="bg-blue-500 text-white p-2 text-sm mb-2">
                Select all images with taxis
              </div>
              <div className="grid grid-cols-3 gap-1">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-100 rounded"></div>
                ))}
              </div>
              <div className="flex justify-center gap-2 mt-2">
                <div className="w-6 h-6 rounded-full border border-gray-300"></div>
                <div className="w-6 h-6 rounded-full border border-gray-300"></div>
                <div className="w-6 h-6 rounded-full border border-gray-300"></div>
              </div>
            </div>
          </div>

          {/* AI Agent Demo Box */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">AI Agent Demo</h2>
            <div className="border rounded-lg p-4 bg-gray-50 border-dashed">
              <div className="text-gray-500 text-center py-16">
                Demo Video/GIF Placeholder
              </div>
            </div>
          </div>
        </div>

        {/* Flow Editor */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">Flow Editor</h2>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
              Create agent
              <span className="text-lg">↗</span>
            </button>
          </div>
          
          <div className="flex-1 bg-gray-50 relative">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, #e5e7eb 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }}>
              {/* Placeholder for react-flow */}
              <div className="p-8 text-gray-500">
                React Flow editor will be implemented here
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;