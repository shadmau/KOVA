import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { baseSepolia } from "viem/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http } from "wagmi";
import { Toaster } from "sonner";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import AppLayout from "@/components/AppLayout";
import { useRouter } from "next/router";
import Navbar from "@/components/navbar";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isHomePage = router.pathname === "/";

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  });

  const config = getDefaultConfig({
    appName: "KOVA",
    projectId: "25195dd15a9741bb3dc1f86d8f11cf1d",
    chains: [baseSepolia],
    transports: {
      [baseSepolia.id]: http(),
    },
    syncConnectedChain: true,
  });

  const Layout = isHomePage
    ? ({ children }: { children: React.ReactNode }) => (
        <>
          <Head>
            <link
              rel="preload"
              href="/fonts/AdelleSans-Regular.woff"
              as="font"
              crossOrigin=""
            />
            <link
              rel="preload"
              href="/fonts/AdelleSans-Regular.woff2"
              as="font"
              crossOrigin=""
            />
            <link
              rel="preload"
              href="/fonts/AdelleSans-Semibold.woff"
              as="font"
              crossOrigin=""
            />
            <link
              rel="preload"
              href="/fonts/AdelleSans-Semibold.woff2"
              as="font"
              crossOrigin=""
            />

            <link rel="icon" href="/favicons/favicon.ico" sizes="any" />
            <link rel="icon" href="/favicons/icon.svg" type="image/svg+xml" />
            <link
              rel="apple-touch-icon"
              href="/favicons/apple-touch-icon.png"
            />
            <link rel="manifest" href="/favicons/manifest.json" />

            <title>KOVA</title>
            <meta name="description" content="KOVA" />
          </Head>
          <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
              <RainbowKitProvider>
                <Navbar />
                {children}
              </RainbowKitProvider>
            </QueryClientProvider>
          </WagmiProvider>
        </>
      )
    : AppLayout;

  return (
    <>
      <Head>
        <link
          rel="preload"
          href="/fonts/AdelleSans-Regular.woff"
          as="font"
          crossOrigin=""
        />
        <link
          rel="preload"
          href="/fonts/AdelleSans-Regular.woff2"
          as="font"
          crossOrigin=""
        />
        <link
          rel="preload"
          href="/fonts/AdelleSans-Semibold.woff"
          as="font"
          crossOrigin=""
        />
        <link
          rel="preload"
          href="/fonts/AdelleSans-Semibold.woff2"
          as="font"
          crossOrigin=""
        />

        <link rel="icon" href="/favicons/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicons/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png" />
        <link rel="manifest" href="/favicons/manifest.json" />

        <title>KOVA</title>
        <meta name="description" content="KOVA" />
      </Head>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <Layout>
              <Component {...pageProps} />
            </Layout>
            <Toaster />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </>
  );
}

export default MyApp;
