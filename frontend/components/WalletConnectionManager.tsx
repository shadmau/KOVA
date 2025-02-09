import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

const WalletConnectionManager = ({
  shouldShowConnectDialog,
}: {
  shouldShowConnectDialog: boolean;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [hasAttemptedConnection, setHasAttemptedConnection] =
    React.useState(false);
  const { openConnectModal } = useConnectModal();

  const { isConnected, status } = useAccount();

  const [isMobile, setIsMobile] = React.useState(false);

 React.useEffect(() => {
   if (status === "connected") {
     setIsOpen(false);
     setHasAttemptedConnection(true);
   } else if (
     shouldShowConnectDialog &&
     !hasAttemptedConnection &&
     status !== "reconnecting"
   ) {
     setIsOpen(true);
   }
 }, [shouldShowConnectDialog, status, hasAttemptedConnection]);

 // Handle mobile detection
 React.useEffect(() => {
   const checkMobile = () => {
     setIsMobile(window.innerWidth < 768);
   };
   checkMobile();
   window.addEventListener("resize", checkMobile);
   return () => window.removeEventListener("resize", checkMobile);
 }, []);

 const handleConnectClick = () => {
   setHasAttemptedConnection(true);
   openConnectModal?.();
 };
  
  
  // Mobile warning component
  const MobileWarning = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="mx-4 rounded-lg bg-white p-6 text-center dark:bg-gray-800">
        <div className="mb-4 text-yellow-500">
          <svg
            className="mx-auto h-12 w-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
          Desktop Experience Recommended
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          For the best experience with our dApp, please switch to a desktop
          browser.
        </p>
      </div>
    </div>
  );

  if (isConnected) return null;

  return (
    <>
      {isMobile && <MobileWarning />}
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          // Only allow closing if connected or if user has attempted connection
          if (isConnected || hasAttemptedConnection) {
            setIsOpen(open);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Your Wallet</DialogTitle>
            <DialogDescription>
              Please connect your wallet to access the application.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col items-center gap-4 rounded-lg bg-gray-50 p-6 dark:bg-gray-900">
              <Wallet className="h-12 w-12 text-purple-500" />
              <div className="text-center">
                <h3 className="text-lg font-semibold">No Wallet Connected</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Connect your wallet to access all features
                </p>
              </div>
              <Button className="w-full" onClick={handleConnectClick}>
                Connect Wallet
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WalletConnectionManager;
