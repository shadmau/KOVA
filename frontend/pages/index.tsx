import Navbar from "@/components/navbar";
import { useLogin } from "@privy-io/react-auth";
import { useRouter } from "next/router";
import Head from "next/head";
import React from "react";
import { AuroraText } from "@/components/ui/aurora-text";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { BackgroundLines } from "@/components/ui/background-lines";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { GlowingEffectCards } from "@/components/ui/GlowingEffectCards";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useLogin({
    onComplete: () => router.push("/createAgent"),
  });

  const words =
    "Privacy-first AI-driven platform that helps you create, manage, and scale AI trading/investing strategies";

  return (
    <>
      <Head>
        <title>Login · Privy</title>
      </Head>

      <main className="min-h-screen w-screen">
        <Navbar onClickHandler={login} />
        <div className="min-h-screen">
          {/* Hero Section */}
          <div className="relative">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-purple-500/10 to-pink-500/10 pointer-events-none" />

            <BackgroundLines className="flex items-center justify-center w-full flex-col px-4 min-h-[80vh]">
              <div className="mx-auto max-w-5xl text-center">
                {/* Aceternity UI Text Generate Effect */}
                <h1 className="text-2xl md:text-4xl lg:text-9xl py-2 md:py-10 font-extrabold tracking-tight">
                  <AuroraText>KovaAI</AuroraText>
                </h1>
                <span className="text-gray-500">
                  <TypingAnimation>{words}</TypingAnimation>
                </span>

                <div className="z-10 flex min-h-64 items-center justify-center">
                  <AnimatedGradientText>
                    🎉 <hr className="mx-2 h-4 w-px shrink-0 bg-gray-300" />{" "}
                    <span
                      className={cn(
                        `inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`
                      )}
                    >
                      Create your Agent
                    </span>
                    <ChevronRight className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
                  </AnimatedGradientText>
                </div>
              </div>
            </BackgroundLines>
          </div>

          {/* Features Section with glass morphism effect */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-12">
              <AnimatedGradientText>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Powerful Features for Smart Trading
                </h2>
              </AnimatedGradientText>
            </div>
            <div className="mt-10">
              <GlowingEffectCards />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
