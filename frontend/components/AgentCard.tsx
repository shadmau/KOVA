import React, { useState } from "react";
import { Users, Activity, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AgentAvailabilityDialog from "./AgentAvailabilityDialog";
import { useReadContracts } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Abi } from "viem";

const ROOM_ADDRESS = process.env
  .NEXT_PUBLIC_ROOM_AGENT_CONTRACT_ADDRESS as `0x${string}`;
const SUBGRAPH_URL_FOR_ROOMS =
  process.env.NEXT_PUBLIC_SUBGRAPH_URL_FOR_ROOMS || "YOUR_SUBGRAPH_URL";
const PINATA_GATEWAY =
  "https://tomato-ancient-guineafowl-410.mypinata.cloud/ipfs/";

interface TradingStrategy {
  tradingStrategy: string;
  assets: string[];
  tradingGoals: string;
  riskLevel: string;
}

const fetchRoomCreated = async (agentId: string) => {
  try {
    const response = await axios.post(SUBGRAPH_URL_FOR_ROOMS, {
      query: `
        query FetchRoomCreated($agentId: String!) {
          roomCreateds(first: 1000, where: { agentId: $agentId }) {
            id
            roomId
            agentId
          }
        }
      `,
      variables: { agentId },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching room data:", error);
    return null;
  }
};

const fetchTradingStrategy = async (
  uri: string
): Promise<TradingStrategy | null> => {
  try {
    const cid = uri.replace("ipfs://", "");
    const response = await axios.get(`${PINATA_GATEWAY}${cid}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching trading strategy:", error);
    return null;
  }
};

export const AgentCard = ({ agent, contractAddress }: any) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  // Fetch room data using GraphQL
  const { data: roomData } = useQuery({
    queryKey: ["roomCreated", agent.tokenId.toString()],
    queryFn: () => fetchRoomCreated(agent.tokenId.toString()),
    enabled: agent.agentType === 0, // Only enabled for traders
  });

  // Fetch trading strategy if agent is a trader
  const { data: tradingStrategy } = useQuery({
    queryKey: ["tradingStrategy", agent.userPromptURI],
    queryFn: () => fetchTradingStrategy(agent.userPromptURI || ""),
    enabled: agent.agentType === 0 && !!agent.userPromptURI,
  });
  console.log("Trading strategies ", tradingStrategy);
  // If rooms exist, check their status
  const roomIds =
    agent.agentType === 0
      ? roomData?.roomCreateds?.map((room: any) => BigInt(room.roomId)) || []
      : [];
  const { data: roomStatuses } = useReadContracts({
    contracts: roomIds.map((roomId: any) => ({
      address: ROOM_ADDRESS,
      abi: [
        {
          name: "viewRoomStatus",
          type: "function",
          stateMutability: "view",
          inputs: [{ name: "roomId", type: "uint256" }],
          outputs: [{ name: "", type: "uint8" }],
        },
      ] as const,
      functionName: "viewRoomStatus",
      args: [roomId],
    })),
    query: {
      enabled: agent.agentType === 0 && roomIds.length > 0,
    },
  });

  React.useEffect(() => {
    if (agent.agentType === 0) {
      if (roomStatuses) {
        const hasOpenRoom = roomStatuses.some((status) => status.result === 0);
        setIsAvailable(hasOpenRoom);
      }
    } else {
      setIsAvailable(false);
    }
  }, [roomStatuses, agent.agentType]);

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-blue-500/10 rounded-full blur-2xl transform group-hover:scale-150 transition-transform duration-500" />

      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-semibold">
            {agent.name || `Agent ${agent.tokenId.toString()}`}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-sm ${
              agent.agentType === 0
                ? "bg-purple-100 text-purple-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {agent.agentType === 0 ? "Trader" : "Investor"}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-500 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Token ID
              </div>
              <div className="font-mono text-sm">
                {agent.tokenId.toString()}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-gray-500 flex items-center">
                <Activity className="w-4 h-4 mr-2" />
                Status
              </div>
              <div className="flex items-center">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isAvailable ? "bg-green-500" : "bg-yellow-500"
                  } mr-2`}
                />
                <span className="text-sm">
                  {isAvailable ? "Available" : "Not Available"}
                </span>
              </div>
            </div>
          </div>

          {agent.agentType === 0 && tradingStrategy && (
            <div className="pt-4 border-t">
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-500">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Trading Strategy
                </div>
                <p className="text-sm">{tradingStrategy.tradingStrategy}</p>
                <div className="flex flex-wrap gap-2">
                  {tradingStrategy?.assets?.map((asset, index) => (
                    <TooltipProvider key={index}>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="secondary">{asset}</Badge>
                        </TooltipTrigger>
                        <TooltipContent>Trading Asset</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                  <Badge variant="outline">
                    {tradingStrategy?.tradingGoals}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      agent.riskLevel === 2
                        ? "text-red-500"
                        : agent.riskLevel === 1
                        ? "text-yellow-500"
                        : "text-green-500"
                    }
                  >
                    {agent.riskLevel === 2
                      ? "High"
                      : agent.riskLevel === "1"
                      ? "Medium"
                      : "Low"}{" "}
                    Risk
                  </Badge>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center text-gray-500">Description</div>
              <span>{agent.description}</span>
            </div>
          </div>

          {!isAvailable && agent.agentType === 0 && (
            <div className="pt-1">
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="w-full"
                variant="outline"
              >
                Make Available
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      <AgentAvailabilityDialog
        isOpen={isDialogOpen}
        tokenId={agent.tokenId}
        contractAddress={contractAddress}
        onClose={() => setIsDialogOpen(false)}
      />
    </Card>
  );
};

export default AgentCard;
