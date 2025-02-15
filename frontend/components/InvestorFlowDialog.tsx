import React, { useEffect, useState } from "react";
import {
  useAccount,
  useBalance,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Gift, Key, Loader2, Users, Wallet } from "lucide-react";
import contractAbi from "@/lib/contractAbis/AgentNFT.json";
import agentRoomAbi from "@/lib/contractAbis/AgentRoom.json";
import axios from "axios";
import { toast } from "sonner";
import { parseEther } from "viem";
import { useRoom } from "@/context/room";
import SecureRoomTransactions from "./SecureRoomTransactions";
import { Card, CardContent } from "./ui/card";

const CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
const ROOM_ADDRESS = process.env
  .NEXT_PUBLIC_ROOM_AGENT_CONTRACT_ADDRESS as `0x${string}`;

const StepCard = ({
  title,
  description,
  icon: Icon,
  isActive,
  isCompleted,
}:any) => (
  <Card
    className={`transition-all duration-200 ${
      isActive ? "ring-2 ring-blue-500" : ""
    } ${isCompleted ? "bg-green-50" : ""}`}
  >
    <CardContent className="p-6">
      <div className="flex items-center space-x-4">
        <div
          className={`p-3 rounded-full ${
            isActive ? "bg-blue-100" : "bg-gray-100"
          } ${isCompleted ? "bg-green-100" : ""}`}
        >
          <Icon
            className={`h-6 w-6 ${
              isActive ? "text-blue-500" : "text-gray-500"
            } ${isCompleted ? "text-green-500" : ""}`}
          />
        </div>
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const InvestorFlowDialog = ({
  isOpen,
  onClose,
  tokenId,
  roomId,
  maxInvestment,
}: any) => {
  const [step, setStep] = useState(1);
  const { setCurrentRoomId } = useRoom();
  const [walletAddress, setWalletAddress] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transferHash, setTransferHash] = useState("");
  const [isFaucetLoading, setIsFaucetLoading] = useState(false);
  const [approveHash, setApproveHash] = useState("");
  const [joinRoomHash, setJoinRoomHash] = useState("");
  const [showSecureRoomSetup, setShowSecureRoomSetup] = useState(false);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(120);
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const { data: balance } = useBalance({
    address,
    token: "0xd1d6A8E7a1593e005FDBC08e978a389127277749", // USDT contract
  });

  const { isLoading: isTransferPending, isSuccess: isTransferSuccess } =
    useWaitForTransactionReceipt({
      hash: transferHash as `0x${string}`,
      confirmations: 1,
    });

  const { isLoading: isApprovePending, isSuccess: isApproveSuccess } =
    useWaitForTransactionReceipt({
      hash: approveHash as `0x${string}`,
      confirmations: 1,
    });

  const {
    isLoading: isJoinRoomPending,
    isSuccess: isJoinRoomSuccess,
    error: joinRoomError,
  } = useWaitForTransactionReceipt({
    hash: joinRoomHash as `0x${string}`,
    confirmations: 1,
  });

  useEffect(() => {
    const fetchWalletAddress = async () => {
      try {
        const response = await axios.get(
          `https://schrank.xyz/api/secure-room/wallet/${roomId}`
        );
        if (response.data.success) {
          setWalletAddress(response.data.walletAddress);
          toast.success("Wallet address fetched successfully");
        } else {
          setError("Failed to fetch wallet address");
        }
      } catch (err) {
        setError("Error connecting to server");
      }
    };

    if (isOpen && roomId) {
      fetchWalletAddress();
    }
  }, [isOpen, roomId]);

  useEffect(() => {
    if (isTransferSuccess) {
      setStep(2);
      toast.success("Funds transferred successfully");
    }
  }, [isTransferSuccess]);

  useEffect(() => {
    if (isApproveSuccess) {
      setStep(3);
      toast.success("Contract approved successfully");
    }
  }, [isApproveSuccess]);

  useEffect(() => {
    if (isJoinRoomSuccess) {
      toast.success("Successfully joined the room");
      setShowSecureRoomSetup(true);
      setCurrentRoomId(roomId);
      setTimeout(() => {
        setShowSecureRoomSetup(false);
        setShowProgressBar(true);
      }, 2000);
    } else if (joinRoomError) {
      toast.error(`Failed to join room: ${joinRoomError.message}`);
      setError(joinRoomError.message);
      setIsLoading(false);
    }
  }, [isJoinRoomSuccess, joinRoomError]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showProgressBar && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setShowProgressBar(false);
      onClose();
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showProgressBar, timeRemaining, onClose]);
  console.log("max inv", parseEther(maxInvestment.toString()));
  const handleTransfer = async () => {
    try {
      setIsLoading(true);
      setError("");

      if (!balance || balance.value < BigInt(maxInvestment)) {
        toast.error("Insufficient balance");
        throw new Error("Insufficient balance");
      }

      const tx = await writeContractAsync({
        address: "0xd1d6A8E7a1593e005FDBC08e978a389127277749",
        abi: [
          {
            constant: false,
            inputs: [
              { name: "_to", type: "address" },
              { name: "_value", type: "uint256" },
            ],
            name: "transfer",
            outputs: [],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
        functionName: "transfer",
        args: [
          walletAddress as `0x${string}`,
          parseEther(maxInvestment.toString()),
        ],
      });

      setTransferHash(tx);
      toast.success("Transfer initiated");
    } catch (err: any) {
      console.log(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setIsLoading(true);
      setError("");

      const tx = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: contractAbi,
        functionName: "approve",
        args: [ROOM_ADDRESS, tokenId],
      });

      setApproveHash(tx);
      toast.success("Approval initiated");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Add validation checks
      if (!roomId || !tokenId) {
        throw new Error("Missing required parameters: roomId or tokenId");
      }

      // Log parameters for debugging
      console.log("Joining room with params:", {
        roomId,
        tokenId,
        ROOM_ADDRESS,
      });

      const tx = await writeContractAsync({
        address: ROOM_ADDRESS,
        abi: agentRoomAbi,
        functionName: "joinRoom",
        args: [roomId, tokenId],
      }).catch((error) => {
        // Log the detailed error
        console.error("Contract call failed:", error);

        // Check for specific error types
        if (error.message.includes("user rejected")) {
          throw new Error("Transaction was rejected by user");
        } else if (error.message.includes("insufficient funds")) {
          throw new Error("Insufficient funds for transaction");
        } else {
          throw new Error(`Transaction failed: ${error.message}`);
        }
      });

      if (tx) {
        setJoinRoomHash(tx);
        toast.success("Join room initiated");
      }
    } catch (err: any) {
      console.error("Join room error:", err);
      setError(err.message || "Failed to join room");
      toast.error(err.message || "Failed to join room");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAbort = () => {
    setShowProgressBar(false);
    setTimeRemaining(120);
    onClose();
  };

  const handleFaucetRequest = async () => {
    if (!address) return;

    setIsFaucetLoading(true);
    try {
      const response = await axios.get(
        `https://schrank.xyz/api/secure-room/faucet/${address}`
      );
      if (response.data.success) {
        toast.success("Tokens received from faucet!");
      } else {
        toast.error("Failed to receive tokens from faucet");
      }
    } catch (error) {
      toast.error("Error requesting tokens from faucet");
    } finally {
      setIsFaucetLoading(false);
    }
  };

  const renderStepContent = () => {
    if (step === 1) {
      const showFaucetButton = balance && balance.value === BigInt(0);

      return (
        <div className="space-y-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Required Investment</span>
              <span className="font-medium">{maxInvestment} USDT</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Current Balance</span>
              <span className="font-medium">
                {balance ? balance.formatted : "0"} USDT
              </span>
            </div>
          </div>

          {showFaucetButton && (
            <Button
              onClick={handleFaucetRequest}
              disabled={isFaucetLoading}
              variant="outline"
              className="w-full mb-2"
            >
              {isFaucetLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Gift className="mr-2 h-4 w-4" />
              )}
              Retrieve from Faucet
            </Button>
          )}

          <Button
            onClick={handleTransfer}
            disabled={isLoading || isTransferPending}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            {isLoading || isTransferPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wallet className="mr-2 h-4 w-4" />
            )}
            Transfer Funds
          </Button>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800">
              Please approve the contract to manage your agent. This is a
              one-time approval needed for secure interactions.
            </p>
          </div>

          <Button
            onClick={handleApprove}
            disabled={isLoading || isApprovePending}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
          >
            {isLoading || isApprovePending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Key className="mr-2 h-4 w-4" />
            )}
            Approve Contract
          </Button>
        </div>
      );
    }

    if (step === 3) {
      return (
        <div className="space-y-6">
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-green-800">
              You're all set! Click below to join the room and start your
              journey.
            </p>
          </div>

          <Button
            onClick={handleJoinRoom}
            disabled={isLoading || isJoinRoomPending}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
          >
            {isLoading || isJoinRoomPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Users className="mr-2 h-4 w-4" />
            )}
            Join Room
          </Button>
        </div>
      );
    }
  };

  const renderContent = () => {
    if (showProgressBar) {
      return (
        <div className="p-6">
          <SecureRoomTransactions
            timeRemaining={timeRemaining}
            onComplete={() => {
              setShowProgressBar(false);
              window.location.reload();
            }}
          />
          <Button
            variant="destructive"
            className="w-full mt-4"
            onClick={handleAbort}
          >
            Abort Session
          </Button>
        </div>
      );
    }

    if (showSecureRoomSetup) {
      return (
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Setting Up Secure Room</h2>
          <p className="text-gray-600">This may take a few moments...</p>
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col space-y-6 p-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <StepCard
            title="Transfer Funds"
            description="Send required USDT to the secure wallet"
            icon={Wallet}
            isActive={step === 1}
            isCompleted={step > 1}
          />
          <StepCard
            title="Approve Contract"
            description="Grant permission for secure operations"
            icon={Key}
            isActive={step === 2}
            isCompleted={step > 2}
          />
          <StepCard
            title="Join Room"
            description="Enter the secure trading environment"
            icon={Users}
            isActive={step === 3}
            isCompleted={step > 3}
          />
        </div>

        {renderStepContent()}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {showProgressBar ? "Secure Room" : "Complete Investment Setup"}
          </DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default InvestorFlowDialog;