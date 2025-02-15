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

 const handleConnectClick = () => {
   setHasAttemptedConnection(true);
   openConnectModal?.();
 };
  
  

  if (isConnected) return null;

  return (
    <>
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
