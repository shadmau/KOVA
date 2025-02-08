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
import { Loader2 } from "lucide-react";
import contractAbi from "@/lib/contractAbis/AgentNFT.json";
import agentRoomAbi from "@/lib/contractAbis/AgentRoom.json";
import axios from "axios";
import { toast } from "sonner";
import { parseEther } from "viem";

const CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
const ROOM_ADDRESS = process.env
  .NEXT_PUBLIC_ROOM_AGENT_CONTRACT_ADDRESS as `0x${string}`;

const InvestorFlowDialog = ({
  isOpen,
  onClose,
  tokenId,
  roomId,
  maxInvestment,
}: any) => {
  const [step, setStep] = useState(1);
  const [walletAddress, setWalletAddress] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transferHash, setTransferHash] = useState("");
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
          `https://schrank.xyz/api/secure-room/wallet/${roomId}`,
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

  const renderContent = () => {
    if (showProgressBar) {
      return (
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Secure Room</h2>
          <p className="text-gray-600">Status: IN_PROGRESS</p>
          <p className="text-center">Discussion is ongoing.</p>
          <p className="text-center text-gray-500">
            Estimated time remaining: {Math.floor(timeRemaining / 60)}:
            {(timeRemaining % 60).toString().padStart(2, "0")}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${(timeRemaining / 120) * 100}%` }}
            ></div>
          </div>
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
      <div className="flex flex-col space-y-4 p-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              <p>Required Investment: {maxInvestment} USDT</p>
              <p>Current Balance: {balance ? balance.formatted : "0"} USDT</p>
              <Button
                onClick={handleTransfer}
                disabled={isLoading || isTransferPending}
                className="w-full"
              >
                {(isLoading || isTransferPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Transfer Funds
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p>Please approve the contract to manage your agent</p>
              <Button
                onClick={handleApprove}
                disabled={isLoading || isApprovePending}
                className="w-full"
              >
                {(isLoading || isApprovePending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Approve Contract
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p>Ready to join the room!</p>
              <Button
                onClick={handleJoinRoom}
                disabled={isLoading || isJoinRoomPending}
                className="w-full"
              >
                {(isLoading || isJoinRoomPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Join Room
              </Button>
            </div>
          )}
        </div>
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
