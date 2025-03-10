import Head from "next/head";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
function UseCasesCarousel() {
  const useCases = [
    {
    title: "Healthcare",
    description: "Secure AI diagnostics without data exposure.",
    icon: "🚑",
    detailedDescription: "KOVA enables you to deploy AI Agents for diagnostics (e.g. analyzing MRI scans for early disease detection). Your agents securely share insights, self-destruct sensitive data after analysis, and ensure compliance with regulations like HIPAA and GDPR.",
    benefits: [
    { icon: "🔐", title: "Agent Ownership", description: "Full control and ownership of your AI Agents, eliminating third-party data risks." },
    { icon: "🛡️", title: "TEE Secure Execution", description: "Sensitive health data remains fully protected at all times." }
    ]
    },
    {
    title: "Cybersecurity",
    description: "AI Agents privately share threat intelligence with zero data exposure.",
    icon: "🛡️",
    detailedDescription: "KOVA enables organizations to collaborate on threat intelligence (e.g. phishing pattern analysis) without exposing sensitive network data. AI Agents autonomously assess risks, coordinate responses, and ensure all interaction remains private.",
    benefits: [
    { icon: "🕵️‍♂️", title: "Autonomous Security", description: "Agents act on threats without data leaks." },
    { icon: "🔒", title: "Data Privacy", description: "Threat intel remains encrypted in Trusted Execution Environments - even during cross-team collaboration." }
    ]
    },
    {
    title: "Biotech & Pharma",
    description: "Accelerate collaborative drug discovery with AI Agents.",
    icon: "🧬",
   
    detailedDescription: "KOVA enables collaboration on AI-driven drug discovery (e.g., analyzing genomic datasets) without exposing proprietary data. AI Agents process sensitive research in TEEs, ensuring your IP stays encrypted and fully under your control.",
    benefits: [
    { icon: "🧪", title: "Secure Discovery", description: "Collaborate without exposing raw datasets." },
    { icon: "🔐", title: "True Data Ownership", description: "You maintain complete control over your research data." }
    ]
    },
    {
    title: "Finance & Trading",
    description: "Securely monetize your trading strategies as tradable assets - without exposing secrets.",
    icon: "📊",
    detailedDescription: "KOVA enables traders and investment firms to license algorithmic trading strategies as digital assets. Investors execute trades in TEEs, ensuring the logic remains private.",
    benefits: [
    { icon: "💹", title: "Encrypted Strategies", description: "Share strategies without risk of exposure." },
    { icon: "💰", title: "Monetization", description: "Securely monetize your algorithmic trading strategies." }
    ]
    },
    {
    title: "Business Automation",
    description: "Privately-owned AI automation: No vendor lock-in.",
    icon: "📈",
    detailedDescription: "KOVA enables enterprises to deploy AI assistants for tasks like HR, payroll, and sales forecasting. Agents operate in TEEs, ensuring workflows run without exposing sensitive data.",
    benefits: [
    { icon: "🗃️", title: "Full Control", description: "AI agents execute tasks in encrypted enclaves — no third-party access, no data leaks." },
    { icon: "💰", title: "Cost Efficiency", description: "Avoid costly SaaS subscriptions and retain ownership of your workflows." }
    ]
    }/*,
    {
    title: "Legal & Compliance",
    description: "Automate compliance audits with confidential, privately-owned AI.",
    icon: "⚖️",
    detailedDescription: "Confidentially automate compliance audits, legal document reviews, and contract analyses with AI Agents. Sensitive information remains fully protected, eliminating exposure risks or unauthorized retention.",
    benefits: [
    { icon: "📜", title: "Private Automation", description: "Confidential document analysis without exposure." },
    { icon: "🔑", title: "Ownership Guarantee", description: "You have full control over your AI Agents." }
    ]
    }*/
    ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUseCase, setSelectedUseCase] = useState<typeof useCases[0] | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // Modal DOM ref for direct manipulation
  const [modalElement, setModalElement] = useState<HTMLDivElement | null>(null);
  
  useEffect(() => {
    // Create modal element in the body on mount
    const modalEl = document.createElement('div');
    modalEl.id = 'modal-root';
    document.body.appendChild(modalEl);
    setModalElement(modalEl);
    
    // Remove on unmount
    return () => {
      if (document.body.contains(modalEl)) {
        document.body.removeChild(modalEl);
      }
    };
  }, []);
  
  // Initialize slide width on first render
  useEffect(() => {
    const handleResize = () => {
      // Just to handle responsive layout changes
      setCurrentIndex(prev => prev);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (modalElement) {
      if (modalOpen && selectedUseCase) {
        renderModal();
      } else {
        // Clear the modal content
        modalElement.innerHTML = '';
      }
    }
  }, [modalOpen, selectedUseCase, modalElement]);

  const handlePrev = () => {
    if (isAnimating) return; 
    
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev <= 0 ? useCases.length - 1 : prev - 1));
      setTimeout(() => {
        setIsAnimating(false);
      }, 200); 
    }, 350); // This is the fade-out duration
  };

  const handleNext = () => {
    if (isAnimating) return; 
    
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev >= useCases.length - 1 ? 0 : prev + 1));
      setTimeout(() => {
        setIsAnimating(false);
      }, 200); 
    }, 350); // This is the fade-out duration
  };

  const openModal = (useCase: typeof useCases[0]) => {
    setSelectedUseCase(useCase);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  // Function to render modal content into the DOM
  const renderModal = () => {
    if (!modalElement || !selectedUseCase) return;
    
    const modalHTML = `
      <div class="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40" 
           style="position: fixed; z-index: 9998; top: 0; left: 0; width: 100vw; height: 100vh; overflow: auto;"
           id="modal-overlay">
      </div>
      <div class="fixed top-0 left-0 w-full h-full flex items-center justify-center p-4"
           style="position: fixed; z-index: 9999; top: 0; left: 0; width: 100vw; height: 100vh; overflow: auto;">
        <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto p-8 transform transition-all"
             id="modal-content">
          <div class="flex justify-between items-start mb-6">
            <div class="flex items-center">
              <div class="flex items-center justify-center h-16 w-16 rounded-full bg-[#FF5C00]/10 text-4xl mr-4">
                ${selectedUseCase.icon}
              </div>
              <h3 class="text-2xl md:text-3xl font-bold text-[#111111] font-['IBM_Plex_Sans']">
                ${selectedUseCase.title}
              </h3>
            </div>
            <button 
              id="modal-close"
              class="text-[#777777] hover:text-[#333333] transition-colors"
              aria-label="Close modal">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div class="text-[#555555] font-['Work_Sans'] mb-8 space-y-4">
            <p class="text-lg font-medium">${selectedUseCase.description}</p>
            <p>${selectedUseCase.detailedDescription}</p>
            
            <div class="mt-6 pt-4 border-t border-[#EEEEEE]">
              <h4 class="text-lg font-semibold text-[#333333] mb-3 font-['IBM_Plex_Sans']">Key Benefits</h4>
              <div class="space-y-3">
                ${selectedUseCase.benefits.map(benefit => `
                  <div class="flex items-start">
                    <div class="text-xl mr-2">${benefit.icon}</div>
                    <div>
                      <span class="font-semibold text-[#333333]">${benefit.title}:</span> 
                      ${benefit.description}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
          
          <div class="flex justify-center">
            <a 
              href="https://forms.gle/mzbyRrqosZEk1Fwg7"
              target="_blank"
              rel="noopener noreferrer"
              class="px-6 py-3 bg-[#FF5C00] hover:bg-[#FF7D00] text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg cursor-pointer"
              id="modal-schedule">
              Explore Partnership
            </a>
          </div>
        </div>
      </div>
    `;
    
    modalElement.innerHTML = modalHTML;
    
    // Add event listeners
    const overlay = document.getElementById('modal-overlay');
    const closeBtn = document.getElementById('modal-close');
    
    if (overlay) overlay.addEventListener('click', closeModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
  };

  // Get the visible cards with a continuous sliding window
  const getVisibleCards = () => {
    if (currentIndex === useCases.length - 1) {
      // When at the last item, show [last, first, second]
      return [
        useCases[currentIndex],
        useCases[0],
        useCases[1],
      ];
    } else if (currentIndex === useCases.length - 2) {
      // When at the second-to-last item, show [second-to-last, last, first]
      return [
        useCases[currentIndex],
        useCases[currentIndex + 1],
        useCases[0],
      ];
    } else {
      // Normal case: show current and next two
      return [
        useCases[currentIndex],
        useCases[currentIndex + 1],
        useCases[currentIndex + 2],
      ];
    }
  };
  
  const visibleCards = getVisibleCards();
  
  return (
    <div className="flex flex-col items-center justify-center mt-8">
      <div className="relative w-full max-w-4xl">
        {/* Previous Button */}
        <button
          onClick={handlePrev}
          disabled={isAnimating}
          aria-label="Previous case"
          className={`absolute left-[-15px] md:left-[-28px] top-1/2 transform -translate-y-1/2 z-10 w-[50px] h-[50px] rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)] transition-all flex items-center justify-center text-[#555555] hover:text-[#FF5C00] border border-[#EEEEEE] hover:border-[#FF5C00]/20 group ${isAnimating ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="transition-transform group-hover:-translate-x-0.5"
          >
            <path 
              d="M15 18L9 12L15 6" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Carousel Container */}
        <div 
          ref={carouselRef}
          className="overflow-hidden w-full"
        >
          {/* Mobile View (single card only) */}
          <div className={`md:hidden transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
            {visibleCards[0] && (
              <div 
                className="bg-white p-6 rounded-lg border border-[#CCCCCC]/20 shadow-[0_5px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_5px_20px_rgba(255,92,0,0.1)] transition-all transform hover:-translate-y-1 duration-300 h-[280px] flex flex-col cursor-pointer"
                onClick={() => openModal(visibleCards[0]!)}
              >
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-[#FF5C00]/10 text-3xl mb-3 mx-auto flex-shrink-0">
                  {visibleCards[0].icon}
                </div>
                <h3 className="text-xl font-semibold text-center font-['IBM_Plex_Sans'] mb-2 text-[#111111] flex-shrink-0">
                  {visibleCards[0].title}
                </h3>
                <p className="text-center text-[#555555] font-['Work_Sans'] text-sm flex-grow overflow-y-auto">
                  {visibleCards[0].description}
                </p>
                {visibleCards[0].detailedDescription && (
                  <button 
                    className="mt-3 text-sm text-[#FF5C00] hover:text-[#FF7D00] font-medium transition-colors duration-200 mx-auto flex items-center flex-shrink-0 pointer-events-none"
                  >
                    Learn More
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                      className="ml-1"
                    >
                      <path 
                        d="M9 18l6-6-6-6" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Desktop View (3 cards side by side) */}
          <div className={`hidden md:grid md:grid-cols-3 gap-4 transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
            {visibleCards.map((useCase, index) => (
              <div
                key={`${index}-${useCase?.title || index}`}
                className="bg-white p-6 rounded-lg border border-[#CCCCCC]/20 shadow-[0_5px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_5px_20px_rgba(255,92,0,0.1)] transition-all transform hover:-translate-y-1 duration-300 h-[280px] flex flex-col cursor-pointer"
                onClick={() => useCase && openModal(useCase)}
              >
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-[#FF5C00]/10 text-3xl mb-3 mx-auto flex-shrink-0">
                  {useCase?.icon}
                </div>
                <h3 className="text-xl font-semibold text-center font-['IBM_Plex_Sans'] mb-2 text-[#111111] flex-shrink-0">
                  {useCase?.title}
                </h3>
                <p className="text-center text-[#555555] font-['Work_Sans'] text-sm flex-grow overflow-y-auto">
                  {useCase?.description}
                </p>
                {useCase?.detailedDescription && (
                  <button 
                    className="mt-3 text-sm text-[#FF5C00] hover:text-[#FF7D00] font-medium transition-colors duration-200 mx-auto flex items-center flex-shrink-0 pointer-events-none"
                  >
                    Learn More
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                      className="ml-1"
                    >
                      <path 
                        d="M9 18l6-6-6-6" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Navigation Controls */}
        <div className="flex justify-between items-center mt-4 md:hidden w-full">
          <button
            onClick={handlePrev}
            disabled={isAnimating}
            aria-label="Previous case"
            className={`p-2 rounded-full bg-white shadow-sm hover:shadow-md border border-[#EEEEEE] hover:border-[#FF5C00]/20 flex items-center justify-center text-[#555555] hover:text-[#FF5C00] ${isAnimating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M15 18L9 12L15 6" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="flex space-x-1">
            {Array.from({ length: useCases.length }).map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-[#FF5C00] w-4"
                    : "bg-[#CCCCCC]/40 w-2"
                }`}
              />
            ))}
          </div>
          <button
            onClick={handleNext}
            disabled={isAnimating}
            aria-label="Next case"
            className={`p-2 rounded-full bg-white shadow-sm hover:shadow-md border border-[#EEEEEE] hover:border-[#FF5C00]/20 flex items-center justify-center text-[#555555] hover:text-[#FF5C00] ${isAnimating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M9 6L15 12L9 18" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={isAnimating}
          aria-label="Next case"
          className={`absolute right-[-15px] md:right-[-28px] top-1/2 transform -translate-y-1/2 z-10 w-[50px] h-[50px] rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)] transition-all flex items-center justify-center text-[#555555] hover:text-[#FF5C00] border border-[#EEEEEE] hover:border-[#FF5C00]/20 group ${isAnimating ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="transition-transform group-hover:translate-x-0.5"
          >
            <path 
              d="M9 6L15 12L9 18" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="hidden md:flex justify-center mt-6 space-x-2">
        {Array.from({ length: useCases.length - 2 }).map((_, index) => (
          <button
            key={index}
            onClick={() => !isAnimating && setCurrentIndex(index)}
            disabled={isAnimating}
            aria-label={`Go to case ${index + 1}`}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex
                ? "bg-[#FF5C00] w-8"
                : "bg-[#CCCCCC]/40 w-2 hover:bg-[#CCCCCC]/60"
            } ${isAnimating ? 'cursor-not-allowed' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      <Head>
        <title>KOVA - Own Your Agent. Own Your Future.</title>
        <meta
          name="description"
          content="Own, control, and protect your AI. KOVA is the secure AI network for builders, investors, and early adopters. Join the future today."
        />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700;800&family=Work+Sans:wght@300;400&family=Fira+Code&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" type="image/png" href="/favicon.png" sizes="512x512" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </Head>

      <main className="min-h-screen bg-[#FFFFFF] text-[#111111]">
        <header className="sticky top-0 z-50 bg-[#FFFFFF]/95 backdrop-blur-sm border-b border-[#CCCCCC]/20 shadow-sm">
          <div className="container mx-auto px-4 py-4 max-w-6xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <img
                  src="/images/kova_logo.png"
                  alt="KOVA Logo"
                  className="h-5 w-auto"
                />
              </div>
              <nav>
                <Link
                  href="https://forms.gle/dkUJUALLc87qFUDQ6"
                  passHref
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="bg-[#FF5C00] text-white border border-[#111111] hover:bg-[#FF5C00] hover:shadow-[0_0_15px_rgba(255,92,0,0.3)] transition-all font-['IBM_Plex_Sans'] font-semibold px-6 py-2 rounded-lg text-sm shadow-md hover:scale-105 hover:shadow-lg transition-transform">
                  Join Waitlist →
                  </Button>
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-16 max-w-6xl">
          <section className="py-16 mb-2 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFFFFF] to-[#FCFCFC] z-0"></div>
            <div className="absolute inset-0 bg-[#FF5C00] opacity-[0.01] z-0"></div>

            <div className="relative z-10">
              {/* Headline */}
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 font-['IBM_Plex_Sans'] text-[#333333] drop-shadow-sm">
                {" "}
                KOVA - Own Your Agent. Own Your Future.
              </h1>

              {/* Subheadline */}
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-[#555555] font-['Work_Sans'] font-normal">
                {" "}
                Secure and private—built for your data, your rules.
              </p>

              {/* Problem Statement Section */}
              <div className="flex items-center justify-center mb-12 md:mb-14 space-x-3 md:space-x-4">
                <svg
                  className="hidden md:block w-6 h-6 md:w-7 md:h-7 text-[#FF5C00]/60"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                  />
                </svg>

                {/* Text (Increased Weight) */}
                <p className="text-lg md:text-xl font-medium text-[#333333] font-['Work_Sans'] tracking-tight">
                  AI Agents influence your health, finances, and education...
                  Shouldn't you control them?{" "}
                </p>
              </div>
              {/*  Video Section  */}
              <div className="relative w-full max-w-4xl mx-auto mb-12 rounded-lg overflow-hidden group perspective-1000">
                <p className="text-base md:text-lg text-[#555555] font-['Work_Sans'] mb-3">
                  🎬 1-min: KOVA secures your AI Agents with shielded vaults.
                </p>
                <div className="relative transform transition-transform duration-500 group-hover:scale-[1.02] shadow-[0_10px_30px_rgba(0,0,0,0.1)] border-2 border-[#CCCCCC] group-hover:border-[#FF5C00] group-hover:shadow-[0_10px_30px_rgba(255,92,0,0.1)] rounded-lg">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#111111]/5 to-transparent z-10 pointer-events-none"></div>

                  <div className="relative pb-[56.25%]">
                    {" "}
                    {/* 16:9 aspect ratio */}
                    <iframe
                      className="absolute top-0 left-0 w-full h-full"
                      src="https://www.youtube.com/embed/dekNTQjvwXY?rel=0"
                      title="KOVA - Own, Control, and Protect Your AI"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              </div>

              <div className="mb-2 flex flex-col items-center space-y-2">
                {/* Primary CTA: Email Signup */}

                <Link
                  href="https://forms.gle/dkUJUALLc87qFUDQ6"
                  passHref
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="mb-4 bg-[#FF5C00] text-white border border-[#111111] hover:bg-[#FF5C00] hover:shadow-[0_0_15px_rgba(255,92,0,0.3)] transition-all font-['IBM_Plex_Sans'] font-semibold px-10 py-4 rounded-lg text-xl shadow-lg hover:scale-105 hover:shadow-xl transition-transform">
                    Join Waitlist →
                  </Button>
                </Link>

                <p className="text-[#555555] font-['Work_Sans'] text-lg">
                  Early access grants exclusive perks
                </p>
                {/*
  <Link href="https://x.com/joinKOVA" passHref target="_blank" rel="noopener noreferrer">
    <Button 
      className="mt-2 bg-white text-[#FF5C00] border border-[#FF5C00] hover:bg-[#FF5C00]/5 transition-all font-['IBM_Plex_Sans'] font-semibold px-8 py-3 rounded-lg shadow-sm"
    >  
      Follow on <span className="mr-2 text-[#FF5C00]">𝕏</span> →
    </Button>
  </Link>
  */}
              </div>
            </div>
          </section>

          <section className="py-16 mb-4">
            <div className="bg-[#FAFAFA] text-[#111111] p-10 rounded-lg shadow-[0_5px_20px_rgba(0,0,0,0.05)] transform transition-all hover:shadow-[0_5px_25px_rgba(0,0,0,0.08)] hover:shadow-[#FF5C00]/5 duration-300 border border-[#CCCCCC]/20">
              <h2 className="text-2xl md:text-3xl font-['IBM_Plex_Sans'] font-semibold mb-4">
                Your AI. Your Rules.
              </h2>
              <p className="text-xl font-['Work_Sans'] leading-relaxed mb-6">
                KOVA is the first AI platform where{" "}
                <strong className="font-bold">you</strong> fully own and control
                your AI Agents-private by design and censorship-free.
              </p>
              {/*
    <div className="text-center">
      <p className="text-lg font-['Work_Sans'] text-[#555555]">
        Ready to shape AI ownership?{" "}
        
        <Link href="https://forms.gle/dkUJUALLc87qFUDQ6" passHref target="_blank" rel="noopener noreferrer">
          <span className="text-[#FF5C00] hover:underline cursor-pointer">Sign up for early updates</span>
        </Link>.
      </p>
    </div>*/}
            </div>
          </section>

          {/* How KOVA Works - New Section */}
          <section className="py-16 pt-2 mb-2">
            <div className="bg-[#FAFAFA] text-[#111111] p-10 rounded-lg shadow-[0_5px_20px_rgba(0,0,0,0.05)] transform transition-all hover:shadow-[0_5px_25px_rgba(0,0,0,0.08)] hover:shadow-[#FF5C00]/5 duration-300 border border-[#CCCCCC]/20">
              <h2 className="text-2xl md:text-3xl font-['IBM_Plex_Sans'] font-semibold mb-6">
                How KOVA Works
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Step 1: NFT Ownership */}
                <div className="bg-white p-6 rounded-lg border border-[#CCCCCC]/30 transition-all duration-300 shadow-[0_5px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_5px_20px_rgba(255,92,0,0.1)] hover:border-[#FF5C00]/30 transform hover:-translate-y-1">
                  <div className="text-sm font-medium text-[#777777] mb-2 font-['IBM_Plex_Sans']">
                    Step 1
                  </div>
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 rounded-full bg-[#FF5C00]/10 flex items-center justify-center text-2xl transition-all duration-300 group-hover:bg-[#FF5C00]/20">
                      🔗
                    </div>
                    <h3 className="text-xl font-semibold ml-3 font-['IBM_Plex_Sans'] text-[#111111] group-hover:text-[#FF5C00] transition-colors">
                      Mint Your Agent
                    </h3>
                  </div>
                  <p className="text-[#555555] font-['Work_Sans']">
                    Each AI Agent is stored on-chain as an NFT. Trade, license,
                    or sell it freely with full autonomy.{" "}
                  </p>
                </div>

                {/* Step 2: Private Computation */}
                <div className="bg-white p-6 rounded-lg border border-[#CCCCCC]/30 transition-all duration-300 shadow-[0_5px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_5px_20px_rgba(255,92,0,0.1)] hover:border-[#FF5C00]/30 transform hover:-translate-y-1">
                  <div className="text-sm font-medium text-[#777777] mb-2 font-['IBM_Plex_Sans']">
                    Step 2
                  </div>
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 rounded-full bg-[#FF5C00]/10 flex items-center justify-center text-2xl transition-all duration-300 group-hover:bg-[#FF5C00]/20">
                      🛡️
                    </div>
                    <h3 className="text-xl font-semibold ml-3 font-['IBM_Plex_Sans'] text-[#111111] group-hover:text-[#FF5C00] transition-colors">
                      Run Privately
                    </h3>
                  </div>
                  <p className="text-[#555555] font-['Work_Sans']">
                    Your Agent runs in shielded vaults (TEEs), protecting data
                    and enforcing your rules with zero leaks.
                  </p>
                </div>

                {/* Step 3: Encrypted Logic */}
                <div className="bg-white p-6 rounded-lg border border-[#CCCCCC]/30 transition-all duration-300 shadow-[0_5px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_5px_20px_rgba(255,92,0,0.1)] hover:border-[#FF5C00]/30 transform hover:-translate-y-1">
                  <div className="text-sm font-medium text-[#777777] mb-2 font-['IBM_Plex_Sans']">
                    Step 3
                  </div>
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 rounded-full bg-[#FF5C00]/10 flex items-center justify-center text-2xl transition-all duration-300 group-hover:bg-[#FF5C00]/20">
                      🔒
                    </div>
                    <h3 className="text-xl font-semibold ml-3 font-['IBM_Plex_Sans'] text-[#111111] group-hover:text-[#FF5C00] transition-colors">
                      Monetize Your Way
                    </h3>
                  </div>
                  <p className="text-[#555555] font-['Work_Sans']">
                    Encrypt your workflows and control sharing. License your
                    Agent's skills, sell insights securely, or collaborate—you
                    set the terms.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="py-16 mb-2 rounded-xl shadow-[0_5px_20px_rgba(0,0,0,0.05)] relative overflow-hidden border border-[#CCCCCC]/30 border-dashed bg-[#FAFAFA]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFFFFF] to-[#F5F5F5] z-0"></div>

            <div className="absolute inset-0 rounded-xl border border-[#FF5C00]/10 shadow-[0_0_15px_rgba(255,92,0,0.05)] pointer-events-none"></div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-16 text-center font-['IBM_Plex_Sans'] text-[#111111] drop-shadow-sm">
                Key Features
              </h2>
              <div className="grid md:grid-cols-2 gap-8 px-8">
                {[
                  {
                    title: "Private AI",
                    description:
                      "Your data stays encrypted and never leaves your control",
                    icon: "🔒",
                  },
                  {
                    title: "Full Ownership",
                    description:
                      "You own your AI Agents and all the data they process",
                    icon: "🛡️",
                  },
                  {
                    title: "Decentralized",
                    description:
                      "No central authority or corporate surveillance",
                    icon: "🌐",
                  },
                  {
                    title: "Monetize & Collaborate",
                    description:
                      "Turn your Agents into services—trade, license, or share them securely without leaking data or losing control",
                    icon: "🔄",
                  },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="bg-white p-8 rounded-lg border border-[#CCCCCC]/30 transition-all duration-300 shadow-[0_5px_15px_rgba(0,0,0,0.03)] group hover:shadow-[0_5px_20px_rgba(255,92,0,0.1)] hover:border-[#FF5C00]/30 transform hover:-translate-y-1"
                  >
                    <div className="text-4xl mb-4 group-hover:text-[#FF5C00] transition-colors">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-3 font-['IBM_Plex_Sans'] text-[#111111] group-hover:text-[#FF5C00] transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-[#555555] font-['Work_Sans']">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
{/* Use Cases Section */}
<div className="container mx-auto px-4 max-w-6xl">
  <section className="py-16 pt-2 mb-2">
    <div className="bg-[#FAFAFA] text-[#111111] p-10 rounded-lg shadow-[0_5px_20px_rgba(0,0,0,0.05)] transform transition-all hover:shadow-[0_5px_25px_rgba(0,0,0,0.08)] hover:shadow-[#FF5C00]/5 duration-300 border border-[#CCCCCC]/20">
      <h2 className="text-2xl md:text-3xl font-['IBM_Plex_Sans'] font-semibold mb-6 text-center">
        Industry Solutions
      </h2>
      <UseCasesCarousel />
    </div>
  </section>
</div>

        {/* Future of KOVA Section  */}
        <div className="container mx-auto px-4 max-w-6xl mb-10">
          <section className="py-16 mb-2 rounded-xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFF6F1] to-[#FFFFFF] z-0"></div>
            <div className="absolute inset-0 bg-[#FF5C00] opacity-[0.01] z-0"></div>

            <div className="absolute inset-0 rounded-xl border border-[#FF5C00]/10 shadow-[0_0_30px_rgba(255,92,0,0.05)] pointer-events-none"></div>

            <div className="relative z-10 text-center px-6 md:px-16 max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-3 font-['IBM_Plex_Sans'] text-[#111111] drop-shadow-sm">
                The Future of KOVA
              </h2>

              <div className="space-y-6 mb-12 text-left md:text-center">
                <div className="flex flex-col md:items-center">
                  <div className="bg-[#FF5C00]/5 w-16 h-1 mb-4 rounded-full"></div>
                  <p className="text-xl font-['Work_Sans'] leading-relaxed">
                    Build an ecosystem where AI Agents{" "}
                    <span className="text-[#FF5C00]">
                      collaborate securely across industries
                    </span>
                    .
                  </p>
                </div>

                <div className="flex flex-col md:items-center">
                  <div className="bg-[#FF5C00]/5 w-16 h-1 mb-4 rounded-full"></div>
                  <p className="text-xl font-['Work_Sans'] leading-relaxed">
                    Empower you to{" "}
                    <span className="text-[#FF5C00]">monetize AI Agents</span>{" "}
                    as easily as sharing a photo
                  </p>
                </div>

                <div className="flex flex-col md:items-center">
                  <div className="bg-[#FF5C00]/5 w-16 h-1 mb-4 rounded-full"></div>
                  <p className="text-xl font-['Work_Sans'] leading-relaxed">
                    Create a world where{" "}
                    <span className="text-[#FF5C00]">AI ownership</span> is a
                    fundamental digital right
                  </p>
                </div>
              </div>

              <div className="mt-10">
                <Link
                  href="https://forms.gle/dkUJUALLc87qFUDQ6"
                  passHref
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="bg-white text-[#FF5C00] border border-[#FF5C00] hover:bg-[#FF5C00]/5 transition-all font-['IBM_Plex_Sans'] font-semibold px-8 py-3 rounded-lg shadow-sm">
                    Join us early—shape the future of AI →
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </div>

        {/* Lightened Footer */}
        <footer className="bg-[#FAFAFA] text-[#111111] py-12 border-t border-[#CCCCCC]/30">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="mb-4">
                  <img
                    src="/images/kova_logo.png"
                    alt="KOVA Logo"
                    className="h-5 w-auto"
                  />
                </div>
                <p className="text-[#555555] font-['Work_Sans'] mb-4">
                  AI Agents that work for you
                </p>
                <p className="text-[#555555] font-['Work_Sans'] mb-2">
                  <span className="text-[#FF5C00]">✉️</span>{" "}
                  <a
                    href="mailto:felix@kova.sh"
                    className="hover:text-[#FF5C00] hover:underline transition-colors"
                  >
                    felix@kova.sh
                  </a>
                </p>
                <p className="text-[#555555] font-['Work_Sans'] mb-2">
                  <span className="text-[#FF5C00]">💬</span>{" "}
                  <a
                    href="https://t.me/j0xnvm0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#FF5C00] hover:underline transition-colors"
                  >
                    Telegram
                  </a>
                </p>
              </div>
              <div className="flex flex-col md:items-end justify-start md:pt-[72px]">
                <a
                  href="https://x.com/joinKOVA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-[#555555] hover:text-[#FF5C00] hover:underline transition-colors font-['IBM_Plex_Sans'] mb-2"
                >
                  <span className="mr-2 text-[#FF5C00]">𝕏</span> Follow Updates
                  →
                </a>

                <a
                  href="https://forms.gle/dkUJUALLc87qFUDQ6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-[#555555] hover:text-[#FF5C00] hover:underline transition-colors font-['IBM_Plex_Sans']"
                >
                  <span className="mr-2 text-[#FF5C00]">🚀</span> Early Access
                </a>
              </div>
            </div>
            <div className="border-t border-[#CCCCCC]/30 mt-8 pt-8 text-center text-[#555555] font-['Work_Sans']">
              <p>© {new Date().getFullYear()} KOVA. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
