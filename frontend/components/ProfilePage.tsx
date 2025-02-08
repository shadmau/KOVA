import React, { useEffect, useState } from "react";
import { useAccount, useReadContracts } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, ExternalLink } from "lucide-react";
import axios from "axios";

import agentNftAbi from "@/lib/contractAbis/AgentNFT.json";
import { Abi } from "viem";
import AgentCard from "./AgentCard";

const CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

const SUBGRAPH_URL =
  process.env.NEXT_PUBLIC_SUBGRAPH_URL || "YOUR_SUBGRAPH_URL";
const SUBGRAPH_URL_FOR_ROOMS =
  process.env.NEXT_PUBLIC_SUBGRAPH_URL_FOR_ROOMS || "YOUR_SUBGRAPH_URL";

// Safely execute API calls without throwing errors
const safeApiCall = async (apiCall: any) => {
  try {
    const result = await apiCall();
    return result;
  } catch (error) {
    return null;
  }
};

const fetchMints = async () => {
  const response = await safeApiCall(() =>
    axios.post(SUBGRAPH_URL, {
      query: `
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
      `,
      variables: { first: 1000, skip: 0 },
    })
  );
  return response?.data?.data || { transfers: [] };
};

const fetchRoomJoins = async (agentId: any) => {
  const response = await safeApiCall(() =>
    axios.post(SUBGRAPH_URL_FOR_ROOMS, {
      query: `
        query FetchRoomJoins($agentId: String!) {
          roomJoineds(first: 1000, where: { agentId: $agentId }) {
            id
            roomId
            agentId
          }
        }
      `,
      variables: { agentId },
    })
  );
  return response?.data?.data || { roomJoineds: [] };
};

const fetchRoomActions = async (roomId: any) => {
  const response = await safeApiCall(() =>
    axios.get(`https://schrank.xyz/api/secure-room/actions/${roomId}`)
  );
  return response?.data || { transactions: [] };
};

const TransactionHistorySkeleton = () => (
  <Card>
    <CardHeader>
      <div className="h-7 w-48 bg-gray-200 rounded animate-pulse" />
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="h-10 bg-gray-100 rounded w-full" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex space-x-4">
            <div className="h-10 bg-gray-200 rounded w-1/5 animate-pulse" />
            <div className="h-10 bg-gray-200 rounded w-1/5 animate-pulse" />
            <div className="h-10 bg-gray-200 rounded w-1/5 animate-pulse" />
            <div className="h-10 bg-gray-200 rounded w-1/5 animate-pulse" />
            <div className="h-10 bg-gray-200 rounded w-1/5 animate-pulse" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const ProfilePage = () => {
  const [tokenIds, setTokenIds] = useState<any[]>([]);
  const { address } = useAccount();
  const [activeAgents, setActiveAgents] = useState({
    traders: [],
    investors: [],
  });

  const { data: mintsData, isLoading: mintsLoading } = useQuery({
    queryKey: ["mints", address],
    queryFn: fetchMints,
    enabled: !!address,
  });

  const agentDataReads = useReadContracts({
    contracts: tokenIds.map((tokenId: any) => ({
      address: CONTRACT_ADDRESS,
      abi: agentNftAbi as Abi,
      functionName: "getAgentData",
      args: [tokenId],
    })),
  });

  const agentExtraDataReads = useReadContracts({
    contracts: tokenIds.map((tokenId: any) => ({
      address: CONTRACT_ADDRESS,
      abi: agentNftAbi as Abi,
      functionName: "getAgentExtraData",
      args: [tokenId],
    })),
  });

  const tokenIdStrings = tokenIds.map((id: any) => id.toString());

  const { data: roomActions = {} } = useQuery({
    queryKey: ["roomActions", tokenIdStrings],
    queryFn: async () => {
      const actions: any = {};
      for (const tokenId of tokenIds) {
        const tokenIdString = tokenId.toString();
        const roomJoins = await fetchRoomJoins(tokenIdString);

        if (roomJoins?.roomJoineds) {
          for (const { roomId } of roomJoins.roomJoineds) {
            const roomAction = await fetchRoomActions(roomId);
            if (roomAction?.transactions?.length) {
              actions[roomId] = roomAction;
            }
          }
        }
      }
      return actions;
    },
    refetchInterval: 60000,
    enabled: tokenIds.length > 0,
  });

  useEffect(() => {
    if (mintsData?.transfers) {
      const userTokens = mintsData.transfers
        .filter(
          (transfer: any) =>
            transfer.to.toLowerCase() === address?.toLowerCase()
        )
        .map((transfer: any) => BigInt(transfer.tokenId));
      setTokenIds(userTokens);
    }
  }, [mintsData, address]);

  useEffect(() => {
    if (agentDataReads.data && agentExtraDataReads.data) {
      const traders: any = [];
      const investors: any = [];

      agentDataReads.data.forEach((agentData: any, index) => {
        if (!agentData || !agentExtraDataReads.data[index]) return;

        const extraData: any = agentExtraDataReads.data[index];
        console.log(extraData);
        const [name, description, model, userPromptURI] = agentData.result;

        const [agentType, riskLevel, investmentAmount, preferredAssets] =
          extraData.result;
        const agent = {
          tokenId: tokenIds[index],
          name,
          description,
          model,
          userPromptURI,
          agentType,
          riskLevel,
          investmentAmount,
          preferredAssets,
        };
        console.log(agent);

        if (agentType === 0) {
          traders.push(agent);
        } else {
          investors.push(agent);
        }
      });

      setActiveAgents({ traders, investors });
    }
  }, [agentDataReads.data, agentExtraDataReads.data, tokenIds]);

  if (mintsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
          <p className="text-gray-600">
            Fetching your live transaction activity...
          </p>
        </div>
      </div>
    );
  }

  const renderTransactionHistory = () =>
    Object.keys(roomActions || {}).length === 0 ? (
      <TransactionHistorySkeleton />
    ) : (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction Hash</TableHead>
                <TableHead>Room ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Volume (USD)</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(roomActions || {}).map(([roomId, data]: any[]) =>
                (data?.transactions || []).map((tx: any, index: any) => (
                  <TableRow key={`${roomId}-${index}`}>
                    <TableCell>
                      <a
                        href={`https://sepolia.basescan.org/tx/${tx.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-500 hover:text-blue-600"
                      >
                        {tx?.txHash?.slice(0, 6)}...{tx?.txHash?.slice(-4)}
                        <ExternalLink className="ml-1 h-4 w-4" />
                      </a>
                    </TableCell>
                    <TableCell>{roomId}</TableCell>
                    <TableCell>{tx.type}</TableCell>
                    <TableCell>${Number(tx.volumeUSD).toFixed(3)}</TableCell>
                    <TableCell>
                      {new Date(tx.timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Tabs defaultValue="history" className="w-full">
        <TabsList className="relative mb-6 w-[590px] justify-start rounded-xl bg-transparent ">
          <div className="absolute inset-0 bg- p-8" />
          <TabsTrigger
            value="history"
            className="relative z-10 rounded-lg px-6 py-3 font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-lg"
          >
            Transaction History
          </TabsTrigger>
          <TabsTrigger
            value="traders"
            className="relative z-10 rounded-lg px-6 py-3 font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-lg"
          >
            Trading Agents ({activeAgents.traders.length})
          </TabsTrigger>
          <TabsTrigger
            value="investors"
            className="relative z-10 rounded-lg px-6 py-3 font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-lg"
          >
            Investor Agents ({activeAgents.investors.length})
          </TabsTrigger>
        </TabsList>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl blur-xl" />

          <TabsContent value="history" className="relative z-10">
            {renderTransactionHistory()}
          </TabsContent>

          <TabsContent value="traders" className="relative z-10">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeAgents.traders.map((agent: any) => (
                <AgentCard
                  key={agent.tokenId.toString()}
                  agent={agent}
                  contractAddress={CONTRACT_ADDRESS}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="investors" className="relative z-10">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeAgents.investors.map((agent: any) => (
                <AgentCard
                  key={agent.tokenId.toString()}
                  agent={agent}
                  contractAddress={CONTRACT_ADDRESS}
                />
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
