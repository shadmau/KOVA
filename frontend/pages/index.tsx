import Head from "next/head";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <>
      <Head>
        <title>KOVA - Own Your Agent. Own Your Future.</title>
        <meta name="description" content="Own, control, and protect your AI. KOVA is the secure AI network for builders, investors, and early adopters. Join the future today." />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700;800&family=Work+Sans:wght@300;400&family=Fira+Code&display=swap" rel="stylesheet" />
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
                <Link href="https://forms.gle/dkUJUALLc87qFUDQ6" passHref target="_blank" rel="noopener noreferrer">
                  <Button 
                    className="bg-[#FF5C00] text-white border border-[#111111] hover:bg-[#FF5C00] hover:shadow-[0_0_15px_rgba(255,92,0,0.3)] transition-all font-['IBM_Plex_Sans'] font-semibold px-6 py-2 rounded-lg text-sm shadow-md hover:scale-105 hover:shadow-lg transition-transform"
                  >
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
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 font-['IBM_Plex_Sans'] text-[#333333] drop-shadow-sm">
                KOVA - Own Your Agent. Own Your Future.
              </h1>
              <p className="text-xl md:text-2xl mb-16 max-w-3xl mx-auto text-[#555555] font-['Work_Sans'] font-light">
                Secure and private—built for your data, your rules.  
              </p>

              {/*  Video Section  */}
              <div className="relative w-full max-w-4xl mx-auto mb-16 rounded-lg overflow-hidden group perspective-1000">
              <p className="text-lg text-[#555555] font-['Work_Sans'] mb-2">
                  🎬 1-Minute Explainer Video
                  </p>
                <div className="relative transform transition-transform duration-500 group-hover:scale-[1.02] shadow-[0_10px_30px_rgba(0,0,0,0.1)] border-2 border-[#CCCCCC] group-hover:border-[#FF5C00] group-hover:shadow-[0_10px_30px_rgba(255,92,0,0.1)] rounded-lg">
             
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#111111]/5 to-transparent z-10 pointer-events-none"></div>
                 
                  <div className="relative pb-[56.25%]"> {/* 16:9 aspect ratio */}
                    <iframe 
                      className="absolute top-0 left-0 w-full h-full"
                      src="https://www.youtube.com/embed/9ZoSBpoFVO8?rel=0" 
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

  <Link href="https://forms.gle/dkUJUALLc87qFUDQ6" passHref target="_blank" rel="noopener noreferrer">
    <Button 
      className="mb-4 bg-[#FF5C00] text-white border border-[#111111] hover:bg-[#FF5C00] hover:shadow-[0_0_15px_rgba(255,92,0,0.3)] transition-all font-['IBM_Plex_Sans'] font-semibold px-10 py-4 rounded-lg text-xl shadow-lg hover:scale-105 hover:shadow-xl transition-transform"
    >
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

          <section className="py-16 mb-0">  
  <div className="bg-[#FAFAFA] text-[#111111] p-10 rounded-lg shadow-[0_5px_20px_rgba(0,0,0,0.05)] transform transition-all hover:shadow-[0_5px_25px_rgba(0,0,0,0.08)] hover:shadow-[#FF5C00]/5 duration-300 border border-[#CCCCCC]/20">
    <h2 className="text-2xl md:text-3xl font-['IBM_Plex_Sans'] font-semibold mb-4">Your AI. Your Rules.</h2>
    <p className="text-xl font-['Work_Sans'] leading-relaxed mb-6">
  KOVA is the first AI platform where <strong className="font-bold">you</strong> fully own and control your AI Agents-private by design and censorship-free.
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
          <section className="py-16 mb-2">
            <div className="bg-[#FAFAFA] text-[#111111] p-10 rounded-lg shadow-[0_5px_20px_rgba(0,0,0,0.05)] transform transition-all hover:shadow-[0_5px_25px_rgba(0,0,0,0.08)] hover:shadow-[#FF5C00]/5 duration-300 border border-[#CCCCCC]/20">
              <h2 className="text-2xl md:text-3xl font-['IBM_Plex_Sans'] font-semibold mb-6">
                How KOVA Works
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Step 1: NFT Ownership */}
                <div className="bg-white p-6 rounded-lg border border-[#CCCCCC]/30 transition-all duration-300 shadow-[0_5px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_5px_20px_rgba(255,92,0,0.1)] hover:border-[#FF5C00]/30 transform hover:-translate-y-1">
                  <div className="text-sm font-medium text-[#777777] mb-2 font-['IBM_Plex_Sans']">Step 1</div>
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 rounded-full bg-[#FF5C00]/10 flex items-center justify-center text-2xl transition-all duration-300 group-hover:bg-[#FF5C00]/20">
                      🔗
                    </div>
                    <h3 className="text-xl font-semibold ml-3 font-['IBM_Plex_Sans'] text-[#111111] group-hover:text-[#FF5C00] transition-colors">Mint Your Agent</h3>
                  </div>
                  <p className="text-[#555555] font-['Work_Sans']">
                  Each AI Agent is stored on-chain as an NFT. Trade, license, or sell it freely with full autonomy.                  </p>
                </div>

                {/* Step 2: Private Computation */}
                <div className="bg-white p-6 rounded-lg border border-[#CCCCCC]/30 transition-all duration-300 shadow-[0_5px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_5px_20px_rgba(255,92,0,0.1)] hover:border-[#FF5C00]/30 transform hover:-translate-y-1">
                  <div className="text-sm font-medium text-[#777777] mb-2 font-['IBM_Plex_Sans']">Step 2</div>
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 rounded-full bg-[#FF5C00]/10 flex items-center justify-center text-2xl transition-all duration-300 group-hover:bg-[#FF5C00]/20">
                      🛡️
                    </div>
                    <h3 className="text-xl font-semibold ml-3 font-['IBM_Plex_Sans'] text-[#111111] group-hover:text-[#FF5C00] transition-colors">Run Privately</h3>
                  </div>
                  <p className="text-[#555555] font-['Work_Sans']">
                  Your Agent runs in shielded vaults (TEEs), protecting data and enforcing your rules with zero leaks.</p>
                </div>

                {/* Step 3: Encrypted Logic */}
                <div className="bg-white p-6 rounded-lg border border-[#CCCCCC]/30 transition-all duration-300 shadow-[0_5px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_5px_20px_rgba(255,92,0,0.1)] hover:border-[#FF5C00]/30 transform hover:-translate-y-1">
                  <div className="text-sm font-medium text-[#777777] mb-2 font-['IBM_Plex_Sans']">Step 3</div>
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 rounded-full bg-[#FF5C00]/10 flex items-center justify-center text-2xl transition-all duration-300 group-hover:bg-[#FF5C00]/20">
                      🔒
                    </div>
                    <h3 className="text-xl font-semibold ml-3 font-['IBM_Plex_Sans'] text-[#111111] group-hover:text-[#FF5C00] transition-colors">Profit Your Way</h3>
                  </div>
                  <p className="text-[#555555] font-['Work_Sans']">
                  Encrypt your workflows and control sharing. License your Agent's skills, sell insights securely, or collaborate—you set the terms.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="py-16 mb-2 rounded-xl shadow-[0_5px_20px_rgba(0,0,0,0.05)] relative overflow-hidden border border-[#CCCCCC]/30 border-dashed bg-[#FAFAFA]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFFFFF] to-[#F5F5F5] z-0"></div>
            
            <div className="absolute inset-0 rounded-xl border border-[#FF5C00]/10 shadow-[0_0_15px_rgba(255,92,0,0.05)] pointer-events-none"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-16 text-center font-['IBM_Plex_Sans'] text-[#111111] drop-shadow-sm">Key Features</h2>
              <div className="grid md:grid-cols-2 gap-8 px-8">
                {[
                  {
                    title: "Private AI",
                    description: "Your data stays encrypted and never leaves your control",
                    icon: "🔒"
                  },
                  {
                    title: "Full Ownership",
                    description: "You own your AI agents and all the data they process",
                    icon: "🛡️"
                  },
                  {
                    title: "Decentralized",
                    description: "No central authority or corporate surveillance",
                    icon: "🌐"
                  },
                  {
                    title: "Monetize & Collaborate",
                    description: "Turn your Agents into services—trade, license, or share them securely without leaking data or losing control",
                    icon: "🔄"
                  },
                ].map((feature, index) => (
                  <div 
                    key={index} 
                    className="bg-white p-8 rounded-lg border border-[#CCCCCC]/30 transition-all duration-300 shadow-[0_5px_15px_rgba(0,0,0,0.03)] group hover:shadow-[0_5px_20px_rgba(255,92,0,0.1)] hover:border-[#FF5C00]/30 transform hover:-translate-y-1"
                  >
                    <div className="text-4xl mb-4 group-hover:text-[#FF5C00] transition-colors">{feature.icon}</div>
                    <h3 className="text-xl font-semibold mb-3 font-['IBM_Plex_Sans'] text-[#111111] group-hover:text-[#FF5C00] transition-colors">{feature.title}</h3>
                    <p className="text-[#555555] font-['Work_Sans']">{feature.description}</p>
                  </div>
                ))}
              </div>
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
              <p className="text-xl md:text-2xl font-semibold mb-10 text-[#FF5C00] font-['IBM_Plex_Sans']">
                Own your Agent. Own your future.
              </p>
              
              <div className="space-y-6 mb-12 text-left md:text-center">
                <div className="flex flex-col md:items-center">
                  <div className="bg-[#FF5C00]/5 w-16 h-1 mb-4 rounded-full"></div>
                  <p className="text-xl font-['Work_Sans'] leading-relaxed">
                    Secure collaboration across finance, healthcare, and beyond.
                  </p>
                </div>
                
                <div className="flex flex-col md:items-center">
                  <div className="bg-[#FF5C00]/5 w-16 h-1 mb-4 rounded-full"></div>
                  <p className="text-xl font-['Work_Sans'] leading-relaxed">
                    Shielded vaults ensure permanent privacy and control.
                  </p>
                </div>
                
                <div className="flex flex-col md:items-center">
                  <div className="bg-[#FF5C00]/5 w-16 h-1 mb-4 rounded-full"></div>
                  <p className="text-xl font-['Work_Sans'] leading-relaxed">
                  AI Agents become personal assets controlled by you. 
                  </p>
                </div>
              </div>
              
              <div className="mt-10">
                <Link href="https://forms.gle/dkUJUALLc87qFUDQ6" passHref target="_blank" rel="noopener noreferrer">
                  <Button 
                    className="bg-white text-[#FF5C00] border border-[#FF5C00] hover:bg-[#FF5C00]/5 transition-all font-['IBM_Plex_Sans'] font-semibold px-8 py-3 rounded-lg shadow-sm"
                  >
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
                  <span className="text-[#FF5C00]">✉️</span> <a href="mailto:felix@kova.sh" className="hover:text-[#FF5C00] hover:underline transition-colors">felix@kova.sh</a>
                </p>
                <p className="text-[#555555] font-['Work_Sans']">
                  <span className="text-[#FF5C00]">💬</span> <a href="https://t.me/@j0xnvm0" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF5C00] hover:underline transition-colors">Telegram</a>
                </p>
              </div>
              <div className="flex flex-col md:items-end justify-start md:pt-[72px]">
                <a 
                  href="https://x.com/joinKOVA" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-[#555555] hover:text-[#FF5C00] hover:underline transition-colors font-['IBM_Plex_Sans'] mb-2"
                >
                  <span className="mr-2 text-[#FF5C00]">𝕏</span> Follow Updates →
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
