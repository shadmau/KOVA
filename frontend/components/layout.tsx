import React, { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Navbar from "./navbar";
import { useRouter } from "next/router";

type Props = {
  children?: React.ReactNode;
  accountId: string;
  appName: string;
};

export default function Layout({
  children,
}: Props) {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
    </>
  );
}
