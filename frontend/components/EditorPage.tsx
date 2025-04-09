import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import FlowNode from "./FlowNode";
import MobileWarning from "./MobileWarning";

const EditorPage = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [showMission, setShowMission] = useState(false);
  const [showDemoVideo, setShowDemoVideo] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleTestAgentClick = () => {
    setIsTesting(true);
    setShowDemoVideo(false);
    
    setTimeout(() => {
      setIsTesting(false);
      setShowDemoVideo(true);
    }, 3000); 
  };

  return (
    <div className="h-screen w-full flex flex-col">
      {isMobile && <MobileWarning />}
      
      <Head>
        <title>KOVA | Captcha Solver Editor</title>
        <link rel="stylesheet" href="https://widget.meetvolley.com/static/css/widget.css" />
        <script type="text/javascript" data-widget="https://api.meetvolley.com/api/widgets/public/7df8d3ce-332c-44dd-9334-f3fc1dc55353" src="https://widget.meetvolley.com/widget.js" defer></script>
      </Head>
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
          <div className="space-y-4 relative">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">Challenge</h2>
              </div>
            </div>
            <div className="relative border rounded-lg p-1 bg-white shadow-sm h-[400px] overflow-hidden">
              <a 
                href="/challenges/captcha-v1/index.html"
                target="_blank" 
                rel="noopener noreferrer"
                title="Open challenge in new tab"
                className="absolute top-2 right-2 z-10 text-gray-400 hover:text-blue-600 transition-colors bg-white/70 rounded-full p-0.5 backdrop-blur-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                   <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                   <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                 </svg>
              </a>
              <iframe
                src="/challenges/captcha-v1/index.html"
                title="Captcha Challenge Preview"
                width="100%"
                height="100%"
                className="border-0"
              ></iframe>
            </div>
            <div className="mt-2 text-center"> 
              <button 
                onClick={() => setShowMission(!showMission)}
                className="text-sm text-purple-600 hover:text-purple-800 font-medium py-1 px-3 rounded bg-purple-50 hover:bg-purple-100 transition-colors"
              >
                Your Mission {showMission ? '▲' : '▼'}
              </button>
              {showMission && (
                <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded-md border">
                  Create an AI Agent using the Flow Editor on the right to successfully solve the captcha challenge shown above.
                </p>
              )}
            </div>
          </div>

          {/* AI Agent Demo Box */}
          <div className="space-y-4" title="Agent execution replay appears here after testing">
            <h2 className="text-xl font-semibold">AI Agent Demo</h2>
            <div className="relative border rounded-lg p-2 bg-gray-50 border-dashed flex items-center justify-center min-h-[200px] overflow-hidden text-center">
              {/* Loading Overlay */} 
              {isTesting && (
                <div className="absolute inset-0 bg-gray-500/30 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                   {/* Simple Spinner */}
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
                   <p className="text-white text-sm font-medium">Executing Agent...</p>
                </div>
              )}

              {/* Content (Placeholder or Video) */} 
              {!showDemoVideo ? (
                // Placeholder view
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-2 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                  </svg>
                  <p className="text-sm text-gray-500">
                    Click 'Test Agent' to view the execution replay here.
                  </p>
                </div>
              ) : (
                // Video player view
                <video 
                  ref={videoRef}
                  className="w-full h-auto rounded max-h-[300px]" 
                  src="/videos/demo_video_short.mp4"
                  preload="metadata"
                  controls
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </div>
        </div>

        {/* Flow Editor */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1" title="Number of agents you can mint">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                <span>Mints Available: 8 / 10</span>
              </div>
              <div className="flex items-center gap-1" title="Number of test runs available">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Tests Available: 4 / 10</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleTestAgentClick} // Attach handler
                className="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm"> 
                Test Agent
              </button>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm"> 
                Mint agent
                <span className="text-lg">↗</span>
              </button>
            </div>
          </div>
          
          <div className="flex-1 bg-gray-50 relative">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, #e5e7eb 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }}>
              {/* Remove placeholder and add FlowNodes */}
              <div className="relative w-full h-full p-8">
                <FlowNode 
                  title="Land on challenge screen"
                  type="empty"
                  position={{ x: 300, y: 100 }}
                />
                <FlowNode
                  title="First action (Empty)"
                  type="empty"
                  position={{ x: 300, y: 250 }}
                />
                <FlowNode
                  title="Second action (Empty)"
                  type="empty"
                  position={{ x: 300, y: 400 }}
                />
                
                {/* Connection lines */}
                <svg className="absolute inset-0 pointer-events-none">
                  {/* Calculate line coordinates based on node positions/dimensions */}
                  {/* Example: connecting bottom of first node to top of second node */}
                  <line
                    x1={300 + (200 / 2)}
                    y1={100 + 56}
                    x2={300 + (200 / 2)}
                    y2={250 - 6}
                    stroke="#A855F7"
                    strokeWidth="2"
                    strokeDasharray="4"
                  />
                  {/* Example: connecting bottom of second node to top of third node */}
                   <line
                    x1={300 + (200 / 2)}
                    y1={250 + 56}
                    x2={300 + (200 / 2)}
                    y2={400 - 6}
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