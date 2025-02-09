import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import request from "graphql-request";
import { Search, Filter, Target, Wallet, Check, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { gql } from "graphql-request";
import agentNftAbi from "../lib/contractAbis/AgentNFT.json";
import agentRoomAbi from "../lib/contractAbis/AgentRoom.json";
import { useReadContracts } from "wagmi";
import type { Abi } from "viem";
import { useSearchParams } from "next/navigation";
import InvestorFlowDialog from "./InvestorFlowDialog";

interface Transfer {
  id: string;
  tokenId: string;
  to: string;
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
    roomCreateds(first: 1000, orderBy: roomId) {
      id
      roomId
      agentId
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
  const [availabilityFilter, setAvailabilityFilter] = useState("available");
  const [showInvestorJoinFlow, setShowInvestorJoinFlow] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [tokenIds, setTokenIds] = useState<bigint[]>([]);
  const [agentRoomMapping, setAgentRoomMapping] = useState<Map<string, string>>(
    new Map()
  );
  const [activeFilters, setActiveFilters] = useState({
    riskLevel: true,
    investmentAmount: true,
    model: true,
  });

  const searchParams = useSearchParams();
  const maxInvestment = parseFloat(searchParams.get("maxInvestment") || "0");
  const riskLevel = parseInt(searchParams.get("riskLevel") || "0");
  const investorTokenId = parseInt(searchParams.get("tokenId") || "1");

  const roomsQuery = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const response = await request<{
        roomCreateds: { roomId: string; agentId: string }[];
      }>(SUBGRAPH_URL_FOR_ROOMS, FETCH_ROOMS);

      const mapping = new Map<string, string>();
      response.roomCreateds.forEach(({ roomId, agentId }) => {
        mapping.set(agentId, roomId);
      });
      setAgentRoomMapping(mapping);
      return response.roomCreateds;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    retry: 2,
    refetchInterval: 60 * 1000, // Refetch every minute,
  });

  const uniqueRoomIds = React.useMemo(() => {
    return Array.from(new Set(Array.from(agentRoomMapping.values()))).map(
      (id) => BigInt(id)
    );
  }, [agentRoomMapping]);

  const mintsQuery:any = useQuery({
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
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    retry: 2,
    refetchInterval: 60 * 1000, // Refetch every minute
  });

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

  const roomStatusReads = useReadContracts({
    contracts: uniqueRoomIds.map((roomId) => ({
      address: ROOM_ADDRESS,
      abi: agentRoomAbi as Abi,
      functionName: "viewRoomStatus",
      args: [roomId],
    })),
  });

  const roomStatuses = React.useMemo(() => {
    if (!roomStatusReads.data) return new Map<string, number>();

    const statusMap = new Map<string, number>();
    uniqueRoomIds.forEach((roomId, index) => {
      const result: any = roomStatusReads.data[index];
      if (result.status === "success") {
        statusMap.set(roomId.toString(), Number(result.result));
      }
    });
    return statusMap;
  }, [roomStatusReads.data, uniqueRoomIds]);

  const calculateMatchPercentage = (
    minInvestment: any,
    maxInvestmentParam: any
  ) => {
    if (!maxInvestmentParam) return Math.floor(Math.random() * (100 - 80) + 80);
    const max = parseFloat(maxInvestmentParam);
    const min = parseFloat(minInvestment);
    if (min > max) return 0;
    const ratio = 1 - min / max;
    return Math.floor(80 + ratio * 20);
  };

  const processedAgents = React.useMemo(() => {
    if (!agentDataReads.data || !agentExtraDataReads.data || !mintsQuery.data) {
      return [];
    }

    const agents = agentDataReads.data
      .map((dataResult: any, index) => {
        if (dataResult.status !== "success" || !dataResult.result) return null;

        const extraDataResult: any = agentExtraDataReads.data[index];
        if (extraDataResult.status !== "success" || !extraDataResult.result)
          return null;

        const [name, description, model] = dataResult.result;
        const [agentType, riskLevel, investmentAmount, preferredAssets] =
          extraDataResult.result;

        if (agentType === 1) return null;

        if (
          searchQuery &&
          !name.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return null;
        }

        const tokenId = mintsQuery.data[index].tokenId;
        const roomId = agentRoomMapping.get(tokenId);

        let isAvailable = false;
        if (roomId) {
          const roomStatus = roomStatuses.get(roomId);
          isAvailable = roomStatus === 0;
        }

        return {
          id: tokenId,
          tokenId,
          name,
          description,
          model,
          riskLevel,
          investmentAmount: Number(investmentAmount),
          preferredAssets,
          agentType,
          roomId: roomId || null,
          isAvailable,
        };
      })
      .filter((agent): agent is NonNullable<typeof agent> => agent !== null);

    const filteredAgents = agents.filter((agent) => {
      const meetsInvestmentCriteria = maxInvestment
        ? Number(agent.investmentAmount) <= maxInvestment
        : true;
      const meetsRiskCriteria = riskLevel
        ? agent.riskLevel === riskLevel
        : true;
      return meetsInvestmentCriteria && meetsRiskCriteria;
    });

    return filteredAgents.map((agent) => ({
      ...agent,
      matchPercentage: calculateMatchPercentage(
        agent.investmentAmount,
        maxInvestment
      ),
    }));
  }, [
    agentDataReads.data,
    agentExtraDataReads.data,
    mintsQuery.data,
    searchQuery,
    maxInvestment,
    riskLevel,
    agentRoomMapping,
    roomStatuses,
  ]);

  const filteredAgentsByAvailability = React.useMemo(() => {
    if (availabilityFilter === "all") return processedAgents;
    return processedAgents.filter((agent) =>
      availabilityFilter === "available"
        ? agent.isAvailable
        : !agent.isAvailable
    );
  }, [processedAgents, availabilityFilter]);

  const handleInvestorJoinFlow = (agent: any) => {
    setSelectedAgent(agent);
    setShowInvestorJoinFlow(true);
  };

  const handleCloseDialog = () => {
    setShowInvestorJoinFlow(false);
    setSelectedAgent(null);
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

  const availableCount = processedAgents.filter(
    (agent) => agent.isAvailable
  ).length;
  const unavailableCount = processedAgents.filter(
    (agent) => !agent.isAvailable
  ).length;

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="text-center py-8">Loading agents...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="text-center py-8 text-red-500">
          Error loading agents. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Matched Agents</h1>
      <p className="text-gray-500 mb-6">
        Select an agent that matches your preferences
      </p>

      <div className="flex flex-col gap-6 mb-8">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search agents..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[100px]">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Show Filters</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={activeFilters.riskLevel}
                onCheckedChange={(checked) =>
                  setActiveFilters((prev) => ({ ...prev, riskLevel: checked }))
                }
              >
                Risk Level
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={activeFilters.investmentAmount}
                onCheckedChange={(checked) =>
                  setActiveFilters((prev) => ({
                    ...prev,
                    investmentAmount: checked,
                  }))
                }
              >
                Investment Amount
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={activeFilters.model}
                onCheckedChange={(checked) =>
                  setActiveFilters((prev) => ({ ...prev, model: checked }))
                }
              >
                Model Type
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Tabs
          defaultValue="available"
          className="w-full relative"
          onValueChange={setAvailabilityFilter}
        >
          {/* Gradient background for tabs */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl blur-xl" />

          <TabsList className="relative z-10 mb-6 w-full justify-start rounded-xl bg-transparent p-1">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-xl" />

            <TabsTrigger
              value="available"
              className="relative z-10 flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-lg"
            >
              <Check className="w-4 h-4" />
              Available
              <Badge
                variant="secondary"
                className="ml-2 bg-purple-100 text-purple-700"
              >
                {availableCount}
              </Badge>
            </TabsTrigger>

            <TabsTrigger
              value="unavailable"
              className="relative z-10 flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-lg"
            >
              <Clock className="w-4 h-4" />
              Unavailable
              <Badge
                variant="secondary"
                className="ml-2 bg-purple-100 text-purple-700"
              >
                {unavailableCount}
              </Badge>
            </TabsTrigger>

            <TabsTrigger
              value="all"
              className="relative z-10 flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-lg"
            >
              <Users className="w-4 h-4" />
              All Agents
              <Badge
                variant="secondary"
                className="ml-2 bg-purple-100 text-purple-700"
              >
                {processedAgents.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <div className="relative mt-4">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl blur-xl" />

            {["available", "unavailable", "all"].map((tab) => (
              <TabsContent
                key={tab}
                value={tab}
                className="relative z-10 space-y-4"
              >
                {filteredAgentsByAvailability.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    onSelect={handleInvestorJoinFlow}
                    activeFilters={activeFilters}
                  />
                ))}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>

      {selectedAgent && (
        <InvestorFlowDialog
          isOpen={showInvestorJoinFlow}
          onClose={handleCloseDialog}
          tokenId={investorTokenId}
          roomId={selectedAgent.roomId}
          maxInvestment={maxInvestment}
        />
      )}
    </div>
  );
};

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
// Separate AgentCard component for better organization
const AgentCard = ({ agent, onSelect, activeFilters }: any) => {
  const riskLevel = getRiskLevelLabel(agent.riskLevel);

  return (
    <Card className="hover:shadow-lg transition-shadow">
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
                {agent.matchPercentage}% Match
              </span>
            </div>
            <Button
              disabled={!agent.isAvailable}
              className={`whitespace-nowrap ${
                !agent.isAvailable ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => onSelect(agent)}
            >
              {agent.isAvailable ? "Select Agent →" : "Not Available"}
            </Button>
          </div>
        </div>

        <p className="text-gray-600 mt-4">{agent.description}</p>

        <div className="grid grid-cols-3 gap-4 mt-4">
          {activeFilters.investmentAmount && (
            <div>
              <div className="text-sm text-gray-500">Min Investment</div>
              <div className="font-semibold">{agent.investmentAmount} USDT</div>
            </div>
          )}
          {activeFilters.model && (
            <div>
              <div className="text-sm text-gray-500">Preferred Assets</div>
              <div className="font-semibold">
                {agent.preferredAssets.length > 0 ? "USDT" : "N/A"}
              </div>
            </div>
          )}
          {activeFilters.model && (
            <div>
              <div className="text-sm text-gray-500">Model</div>
              <div className="font-semibold">{agent.model || "N/A"}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchedAgents;
