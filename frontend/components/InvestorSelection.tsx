import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import request from "graphql-request";
import { useReadContracts } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Activity, Loader2 } from "lucide-react";

import type { Abi } from "viem";
import agentNftAbi from "../lib/contractAbis/AgentNFT.json";
import { RainbowButton } from "./ui/rainbow-button";

const CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
const SUBGRAPH_URL =
  process.env.NEXT_PUBLIC_SUBGRAPH_URL || "YOUR_SUBGRAPH_URL";
const SUBGRAPH_URL_FOR_ROOMS =
  process.env.NEXT_PUBLIC_SUBGRAPH_URL_FOR_ROOMS || "YOUR_SUBGRAPH_URL";

const FETCH_MINTS = `
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

const FETCH_ROOM_JOINS = `
  query FetchRoomJoins($agentIds: [String!]!) {
    roomJoineds(first: 1000, where: { agentId_in: $agentIds }) {
      id
      roomId
      agentId
    }
  }
`;

interface Agent {
  id: string;
  name: string;
  description: string;
  model: string;
  riskLevel: number;
  investmentAmount: number;
  preferredAssets: string[];
}

const InvestorSelection = () => {
  const router = useRouter();
  const [tokenIds, setTokenIds] = useState<bigint[]>([]);

  // Fetch mints
  const mintsQuery:any = useQuery({
    queryKey: ["mints"],
    queryFn: async () => {
      const response = await request<{
        transfers: { id: string; tokenId: string; to: string }[];
      }>(SUBGRAPH_URL, FETCH_MINTS, {
        first: 100,
        skip: 0,
      });

      const ids = response.transfers.map((t) => BigInt(t.tokenId));
      setTokenIds(ids);
      return response.transfers;
    },
  });

  // Convert BigInt array to string array for query key
  const tokenIdsForKey = tokenIds.map((id) => id.toString());

  // Fetch room joins to filter out active agents
  const roomJoinsQuery:any = useQuery({
    queryKey: ["roomJoins", tokenIdsForKey],
    queryFn: async () => {
      if (!mintsQuery.data) return { roomJoineds: [] };

      const agentIds = mintsQuery.data.map((t:any) => t.tokenId);
      const response = await request(SUBGRAPH_URL_FOR_ROOMS, FETCH_ROOM_JOINS, {
        agentIds,
      });
      return response;
    },
    enabled: !!mintsQuery.data,
  });

  const agentDataReads = useReadContracts({
    contracts: tokenIds.map((tokenId) => ({
      address: CONTRACT_ADDRESS,
      abi: agentNftAbi as Abi,
      functionName: "getAgentData",
      args: [tokenId],
    })),
  });

  const agentExtraDataReads = useReadContracts({
    contracts: tokenIds.map((tokenId) => ({
      address: CONTRACT_ADDRESS,
      abi: agentNftAbi as Abi,
      functionName: "getAgentExtraData",
      args: [tokenId],
    })),
  });

  const processedAgents = React.useMemo(() => {
    if (
      !agentDataReads.data ||
      !agentExtraDataReads.data ||
      !mintsQuery.data ||
      !roomJoinsQuery.data
    )
      return [];

    // Create a set of agent IDs that are already in rooms
    const activeAgentIds = new Set(
      (roomJoinsQuery.data.roomJoineds || []).map((join: any) => join.agentId)
    );

    return agentDataReads.data
      .map((dataResult: any, index) => {
        if (dataResult.status !== "success" || !dataResult.result) return null;

        const extraDataResult: any = agentExtraDataReads.data[index];
        if (extraDataResult.status !== "success" || !extraDataResult.result)
          return null;

        const tokenId = mintsQuery.data[index].tokenId;

        // Skip if agent is already in a room
        if (activeAgentIds.has(tokenId)) return null;

        const [name, description, model] = dataResult.result;
        const [agentType, riskLevel, investmentAmount, preferredAssets] =
          extraDataResult.result;

        if (agentType !== 1) return null;

        return {
          id: tokenId,
          name,
          description,
          model,
          riskLevel,
          investmentAmount: Number(investmentAmount),
          preferredAssets,
        };
      })
      .filter((agent): agent is NonNullable<typeof agent> => agent !== null);
  }, [
    agentDataReads.data,
    agentExtraDataReads.data,
    mintsQuery.data,
    roomJoinsQuery.data,
  ]);

  const getRiskLabel = (level: number) => {
    switch (level) {
      case 0:
        return { label: "Low Risk", color: "text-green-500" };
      case 1:
        return { label: "Medium Risk", color: "text-yellow-500" };
      case 2:
        return { label: "High Risk", color: "text-red-500" };
      default:
        return { label: "Unknown Risk", color: "text-gray-500" };
    }
  };

  const handleSelectInvestor = (agent: Agent) => {
    router.push(
      `?maxInvestment=${agent.investmentAmount}&riskLevel=${agent.riskLevel}&tokenId=${agent.id}`
    );
  };

  if (
    mintsQuery.isLoading ||
    roomJoinsQuery.isLoading ||
    agentDataReads.isLoading ||
    agentExtraDataReads.isLoading
  ) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
          <p className="text-gray-600">Loading available investor agents...</p>
        </div>
      </div>
    );
  }

  if (
    mintsQuery.isError ||
    agentDataReads.error ||
    agentExtraDataReads.error ||
    roomJoinsQuery.error
  ) {
    return (
      <div className="text-center py-8 text-red-500">
        Error loading investor agents
      </div>
    );
  }

  if (processedAgents.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Select an Investor Agent</h1>
        <Card className="text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center justify-center space-y-4">
              <Users className="h-12 w-12 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900">
                No Available Agents
              </h3>
              <p className="text-sm text-gray-500">
                All investor agents are currently active in rooms or no investor
                agents were found.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Select an Investor Agent</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {processedAgents.map((agent) => {
          const riskLevel = getRiskLabel(agent.riskLevel);

          return (
            <Card
              key={agent.id}
              className="group hover:shadow-lg transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-blue-500/10 rounded-full blur-2xl transform group-hover:scale-150 transition-transform duration-500" />

              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg font-semibold">
                    {agent.name || `Agent ${agent.id}`}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
                    Investor
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
                      <div className="font-mono text-sm">{agent.id}</div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm text-gray-500 flex items-center">
                        <Activity className="w-4 h-4 mr-2" />
                        Investment
                      </div>
                      <div className="text-sm">
                        {agent.investmentAmount} USDT
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className={riskLevel.color}>
                        {riskLevel.label}
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center text-gray-500">
                        Description
                      </div>
                      <span>{agent.description}</span>
                    </div>
                  </div>

                  <RainbowButton
                    onClick={() => handleSelectInvestor(agent)}
                    className="w-full"
                  >
                    Select Agent
                  </RainbowButton>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default InvestorSelection;
