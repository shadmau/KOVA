import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner"; // Assuming you're using sonner for toasts

import contractAbi from "@/lib/contractAbis/AgentNFT.json";
import agentRoomAbi from "@/lib/contractAbis/AgentRoom.json";

interface AgentAvailabilityDialogProps {
  isOpen: boolean;
  tokenId: bigint;
  contractAddress: string;
  onClose: () => void;
}
const ROOM_ADDRESS = process.env
  .NEXT_PUBLIC_ROOM_AGENT_CONTRACT_ADDRESS as `0x${string}`;
const AgentAvailabilityDialog: React.FC<AgentAvailabilityDialogProps> = ({
  isOpen,
  tokenId,
  contractAddress,
  onClose,
}) => {
  const [approveHash, setApproveHash] = useState<`0x${string}` | null>(null);
  const [createRoomHash, setCreateRoomHash] = useState<`0x${string}` | null>(
    null,
  );
  const { writeContractAsync } = useWriteContract();

  const { isSuccess: isApproveSuccess, isError: isApproveError } =
    useWaitForTransactionReceipt({
      hash: approveHash as `0x${string}`,
      confirmations: 1,
    });

  const { isSuccess: isCreateRoomSuccess, isError: isCreateRoomError } =
    useWaitForTransactionReceipt({
      hash: createRoomHash as `0x${string}`,
      confirmations: 1,
    });

  const handleAvailability = async (isAvailable: boolean) => {
    try {
      // Approve the token
      const approveResult = await writeContractAsync({
        address: contractAddress as `0x${string}`,
        functionName: "approve",
        abi: contractAbi,
        args: [ROOM_ADDRESS, tokenId],
      });
      setApproveHash(approveResult);

      if (isAvailable) {
        // Create room if agent is to be made available
        const createRoomResult = await writeContractAsync({
          address: ROOM_ADDRESS,
          abi: agentRoomAbi,
          functionName: "createRoom",
          args: [tokenId],
        });
        setCreateRoomHash(createRoomResult);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error processing agent availability");
      onClose();
    }
  };

  React.useEffect(() => {
    if (isApproveError) {
      toast.error("Approval transaction failed");
      onClose();
    }
    if (isApproveSuccess) {
      toast.success("Agent approved successfully");
    }
  }, [isApproveError, isApproveSuccess]);

  React.useEffect(() => {
    if (isCreateRoomError) {
      toast.error("Failed to create room for agent");
      onClose();
    }
    if (isCreateRoomSuccess) {
      toast.success("Agent made available in marketplace");
      onClose();
    }
  }, [isCreateRoomError, isCreateRoomSuccess]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Make Agent Available?</DialogTitle>
          <DialogDescription>
            Would you like to make this agent available in the marketplace?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-between space-x-4">
          <Button
            variant="outline"
            onClick={() => handleAvailability(false)}
            disabled={!!approveHash}
          >
            No, Keep Private
          </Button>
          <Button
            onClick={() => handleAvailability(true)}
            disabled={!!approveHash}
          >
            {approveHash ? "Processing..." : "Yes, Make Available"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgentAvailabilityDialog;
