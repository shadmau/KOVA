import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import request from "graphql-request";
import { Search, Filter, ArrowLeft, Target, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { gql } from "graphql-request";
import agentNftAbi from "../lib/contractAbis/AgentNFT.json";

import agentRoomAbi from "../lib/contractAbis/AgentRoom.json";
import { useReadContracts } from "wagmi";
import { formatEther } from "viem";
import type { Abi } from "viem";

interface Transfer {
  id: string;
  tokenId: string;
  to: string;
}

interface AgentData {
  id: string;
  tokenId: string;
  name: string;
  description: string;
  model: string;
  riskLevel: number;
  investmentAmount: string;
  preferredAssets: string[];
  agentType: number;
}

const FETCH_MINTS = gql`
  query FetchMints($first: Int, $skip: Int) {
    transfers(
      first: $first
      skip: $skip
      where: { from: "0x0000000000000000000000000000000000000000" }
      orderDirection: desc
    ) {
      id
      tokenId
      to
    }
  }
`;

const FETCH_ROOMS = gql`
  query FetchRooms {
    roomCreateds(first: 100) {
      id
      agentID
    }
    roomFulls(first: 100) {
      id
      agentIDs
    }
  }
`;
const CONTRACT_ADDRESS = process.env
    .NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
  const ROOM_ADDRESS = process.env
  .NEXT_PUBLIC_ROOM_AGENT_CONTRACT_ADDRESS as `0x${string}`;
const SUBGRAPH_URL =
  process.env.NEXT_PUBLIC_SUBGRAPH_URL || "YOUR_SUBGRAPH_URL";
const SUBGRAPH_URL_FOR_ROOMS =
  process.env.NEXT_PUBLIC_SUBGRAPH_URL_FOR_ROOMS || "YOUR_SUBGRAPH_URL";
const MatchedAgents = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [tokenIds, setTokenIds] = useState<bigint[]>([]);
    const [availableAgents, setAvailableAgents] = useState<string[]>([]);
    
     const roomsQuery = useQuery({
       queryKey: ["rooms"],
       queryFn: async () => {
         const response = await request<{
           roomCreateds: { agentID: string }[];
           roomFulls: { agentIDs: string[] }[];
         }>(SUBGRAPH_URL_FOR_ROOMS, FETCH_ROOMS);

         // Find available agents (in created rooms but not in full rooms)
         const createdAgentIds = new Set(
           response.roomCreateds.map((room) => room.agentID)
         );
         const fullRoomAgentIds = new Set(
           response.roomFulls.flatMap((room) => room.agentIDs)
         );

         const availableAgentIds = Array.from(createdAgentIds).filter(
           (id) => !fullRoomAgentIds.has(id)
         );

         setAvailableAgents(availableAgentIds);
         return availableAgentIds;
       },
     });

  // First query: Fetch all minted tokens
  const mintsQuery = useQuery({
    queryKey: ["mints"],
    queryFn: async () => {
      const response = await request<{ transfers: Transfer[] }>(
        SUBGRAPH_URL,
        FETCH_MINTS,
        {
          first: 100,
          skip: 0,
        }
      );

      const ids = response.transfers.map((t) => BigInt(t.tokenId));
      setTokenIds(ids);
      return response.transfers;
    },
  });
 

  // Second query: Read contract data for all tokens at once
  const agentDataReads = useReadContracts({
    contracts: tokenIds.map(
      (tokenId) =>
        ({
          address: CONTRACT_ADDRESS,
          abi: agentNftAbi as Abi,
          functionName: "getAgentData",
          args: [tokenId],
        } as const)
    ),
  });

  // Third query: Read extra agent data
  const agentExtraDataReads = useReadContracts({
    contracts: tokenIds.map(
      (tokenId) =>
        ({
          address: CONTRACT_ADDRESS,
          abi: agentNftAbi as Abi,
          functionName: "getAgentExtraData",
          args: [tokenId],
        } as const)
    ),
  });
    

  // Process and combine the data
const processedAgents = React.useMemo(() => {
  if (!agentDataReads.data || !agentExtraDataReads.data || !mintsQuery.data)
    return [];

  return agentDataReads.data
    .map((dataResult, index) => {
      if (dataResult.status !== "success" || !dataResult.result) return null;

      const extraDataResult = agentExtraDataReads.data[index];
      if (extraDataResult.status !== "success" || !extraDataResult.result)
        return null;

      const [
        name,
        description,
        model,
        _userPromptURI,
        _systemPromptURI,
        _promptsEncrypted,
      ] = dataResult.result as unknown as [
        string,
        string,
        string,
        string,
        string,
        boolean
      ];

      const [agentType, riskLevel, investmentAmount, preferredAssets] =
        extraDataResult.result as unknown as [number, number, bigint, string[]];

      if (agentType === 1) return null;

      if (
        searchQuery &&
        !name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return null;
      }

      return {
        id: mintsQuery.data[index].tokenId,
        tokenId: mintsQuery.data[index].tokenId,
        name,
        description,
        model,
        riskLevel,
        investmentAmount: formatEther(investmentAmount),
        preferredAssets,
        agentType,
        isAvailable: availableAgents.includes(mintsQuery.data[index].tokenId),
        totalTrades: 0,
        winRate: 0,
        avgReturn: 0,
      };
    })
    .filter((agent): agent is NonNullable<typeof agent> => agent !== null);
}, [
  agentDataReads.data,
  agentExtraDataReads.data,
  mintsQuery.data,
  roomsQuery.data,
  availableAgents,
  searchQuery,
]);

  const getRiskLevelLabel = (level: number) => {
    switch (level) {
      case 0:
        return { text: "Low Risk", color: "text-green-600" };
      case 1:
        return { text: "Medium Risk", color: "text-yellow-600" };
      case 2:
        return { text: "High Risk", color: "text-red-600" };
      default:
        return { text: "Unknown Risk", color: "text-gray-600" };
    }
  };

  const getMatchPercentage = () => {
    return Math.floor(Math.random() * (100 - 80) + 80);
  };

  const isLoading =
    mintsQuery.isLoading ||
    agentDataReads.isLoading ||
    agentExtraDataReads.isLoading ||
    roomsQuery.isLoading;

  const isError =
    mintsQuery.isError ||
    Boolean(agentDataReads.error) ||
    Boolean(agentExtraDataReads.error) ||
    roomsQuery.isError;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          className="mr-4"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Agent Creation
        </Button>
      </div>

      <h1 className="text-2xl font-bold mb-2">Matched Agents</h1>
      <p className="text-gray-500 mb-6">
        Select an agent that matches your preferences
      </p>

      <div className="flex gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search agents..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">Loading agents...</div>
        ) : isError ? (
          <div className="text-center py-8 text-red-500">
            Error loading agents
          </div>
        ) : (
          processedAgents.map((agent) => {
            const riskLevel = getRiskLevelLabel(agent.riskLevel);
            const matchPercentage = getMatchPercentage();

            return (
              <Card
                key={agent.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-4">
                      <div className="bg-purple-100 p-3 rounded-full">
                        {agent.riskLevel > 1 ? (
                          <Target className="w-6 h-6 text-purple-600" />
                        ) : (
                          <Wallet className="w-6 h-6 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{agent.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-gray-500">
                            {agent.agentType === 0 ? "Trader" : "Investor"}
                          </span>
                          <span className="text-sm font-medium">•</span>
                          <span className={`text-sm ${riskLevel.color}`}>
                            {riskLevel.text}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <span className="text-purple-600 font-semibold">
                          {matchPercentage}% Match
                        </span>
                      </div>
                      <Button
                        disabled={!agent.isAvailable}
                        className={`whitespace-nowrap ${
                          !agent.isAvailable
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        {agent.isAvailable ? "Select Agent →" : "Not Available"}
                      </Button>
                    </div>
                  </div>

                  <p className="text-gray-600 mt-4">{agent.description}</p>

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <div className="text-sm text-gray-500">
                        Min Investment
                      </div>
                      <div className="font-semibold">
                        {agent.investmentAmount} ETH
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">
                        Preferred Assets
                      </div>
                      <div className="font-semibold">
                        {agent.preferredAssets.length > 0
                          ? agent.preferredAssets.slice(0, 2).join(", ")
                          : "N/A"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Model</div>
                      <div className="font-semibold">
                        {agent.model || "N/A"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MatchedAgents;
