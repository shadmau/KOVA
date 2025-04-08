import React from "react";
import FlowNode from "./FlowNode"; // Ensure FlowNode is imported

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
              {/* Remove placeholder and add FlowNodes */}
              <div className="relative w-full h-full p-8">
                <FlowNode 
                  title="Land on challenge screen - show two boxes"
                  type="action"
                  position={{ x: 100, y: 100 }}
                />
                <FlowNode
                  title="First action (Empty)"
                  type="empty"
                  position={{ x: 100, y: 250 }}
                />
                <FlowNode
                  title="Second action (Empty)"
                  type="empty"
                  position={{ x: 100, y: 400 }}
                />
                
                {/* Connection lines */}
                <svg className="absolute inset-0 pointer-events-none">
                  {/* Calculate line coordinates based on node positions/dimensions */}
                  {/* Example: connecting bottom of first node to top of second node */}
                  <line
                    x1={100 + (200 / 2)} // Center X of node 1 (approx) 
                    y1={100 + 56} // Bottom edge of node 1 (approx height)
                    x2={100 + (200 / 2)} // Center X of node 2
                    y2={250 - 6} // Top edge of node 2 (offset for connector)
                    stroke="#A855F7"
                    strokeWidth="2"
                    strokeDasharray="4"
                  />
                  {/* Example: connecting bottom of second node to top of third node */}
                   <line
                    x1={100 + (200 / 2)} // Center X of node 2
                    y1={250 + 56} // Bottom edge of node 2
                    x2={100 + (200 / 2)} // Center X of node 3
                    y2={400 - 6} // Top edge of node 3
                    stroke="#A855F7"
                    strokeWidth="2"
                    strokeDasharray="4"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;