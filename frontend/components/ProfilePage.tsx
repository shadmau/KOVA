import React, { useEffect, useState } from "react";
import { useAccount, useReadContracts } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, Clock, ExternalLink, Tag, Wallet } from "lucide-react";
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

const fetchAllData = async (address: string) => {
  try {
    // Fetch mints
    const mintsResponse = await axios.post(SUBGRAPH_URL, {
      query: `
        query FetchMints($address: String!) {
          transfers(
            first: 1000
            where: { 
              from: "0x0000000000000000000000000000000000000000"
              to: $address
            }
            orderDirection: desc
          ) {
            id
            tokenId
          }
        }
      `,
      variables: { address: address.toLowerCase() },
    });

    const tokenIds =
      mintsResponse.data?.data?.transfers?.map((t: any) => t.tokenId) || [];

    // Fetch room joins
    const roomJoinsResponse = await axios.post(SUBGRAPH_URL_FOR_ROOMS, {
      query: `
        query FetchAllRoomJoins($tokenIds: [String!]!) {
          roomJoineds(first: 1000, where: { agentId_in: $tokenIds }) {
            id
            roomId
            agentId
          }
        }
      `,
      variables: { tokenIds },
    });

    const roomIds = [
      ...new Set(
        roomJoinsResponse.data?.data?.roomJoineds?.map(
          (rj: any) => rj.roomId
        ) || []
      ),
    ];

    if (roomIds.length === 0) {
      return {
        tokenIds: tokenIds.map((id: string) => BigInt(id)),
        transactions: [],
      };
    }

    const roomActionsResponse = await axios.get(
      `https://schrank.xyz/api/secure-room/actions?roomIds=${roomIds.join(",")}`
    );

  const transactions = Object.entries(roomActionsResponse.data)
    .flatMap(([roomId, roomData]: [string, any]) =>
      (roomData.transactions || []).map((tx:any) => ({
        ...tx,
        roomId,
      }))
    )
    .filter((tx) => tx)
    .sort((a: any, b: any) => b.timestamp - a.timestamp);

   return {
     tokenIds: tokenIds.map((id: string) => BigInt(id)),
     transactions,
   };
  } catch (error) {
    console.error("Error fetching data:", error);
    return { tokenIds: [], transactions: [] };
  }
};

const TransactionHistory = React.memo(
  ({
    transactions,
    isLoading,
  }: {
    transactions: any[];
    isLoading: boolean;
  }) => {
    if (isLoading) {
      return <TransactionHistorySkeleton />;
    }

    if (!transactions.length) {
      return <EmptyTransactionHistory />;
    }

    const getTypeColor = (type: string) => {
      const types = {
        swap: "bg-green-100 text-green-800",
        approve: "bg-blue-100 text-blue-800",
        default: "bg-gray-100 text-gray-800",
      };
      return types[type as keyof typeof types] || types.default;
    };

    return (
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-600" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-full divide-y divide-gray-200">
              {transactions.map((tx: any, index: number) => (
                <div
                  key={`${tx.roomId}-${index}`}
                  className="group hover:bg-gray-50 transition-colors"
                >
                  <div className="p-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <Tag className="h-5 w-5 text-purple-600" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <a
                              href={`https://sepolia.basescan.org/tx/${tx.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-gray-900 hover:text-purple-600 flex items-center gap-1 transition-colors"
                            >
                              {tx.txHash.slice(0, 6)}...{tx.txHash.slice(-4)}
                              <ArrowUpRight className="h-4 w-4" />
                            </a>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(
                                tx.type
                              )}`}
                            >
                              {tx.type}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {new Date(tx.timestamp).toLocaleString()}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="flex items-center gap-1">
                              Room {tx.roomId}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Wallet className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            ${Number(tx.volumeUSD).toFixed(3)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

const TransactionHistorySkeleton = () => (
  <Card>
    <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
      <CardTitle className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-purple-600" />
        Transaction History
      </CardTitle>
    </CardHeader>
    <CardContent className="p-4">
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
            </div>
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const EmptyTransactionHistory = () => (
  <Card>
    <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
      <CardTitle className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-purple-600" />
        Transaction History
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-purple-100 p-4 mb-4">
          <ExternalLink className="h-8 w-8 text-purple-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          No Transactions Found
        </h3>
        <p className="text-sm text-gray-500">
          There are no transactions to display at this time.
        </p>
      </div>
    </CardContent>
  </Card>
);

const ProfilePage = () => {
  const { address } = useAccount();
  const [activeAgents, setActiveAgents] = useState({
    traders: [],
    investors: [],
  });

  const { data: allData, isLoading } = useQuery({
    queryKey: ["allData", address],
    queryFn: () => fetchAllData(address!),
    enabled: !!address,
  });

  const agentDataReads = useReadContracts({
    contracts: (allData?.tokenIds || []).map((tokenId: any) => ({
      address: CONTRACT_ADDRESS,
      abi: agentNftAbi as Abi,
      functionName: "getAgentData",
      args: [tokenId],
    })),
  });

  const agentExtraDataReads = useReadContracts({
    contracts: (allData?.tokenIds || []).map((tokenId: any) => ({
      address: CONTRACT_ADDRESS,
      abi: agentNftAbi as Abi,
      functionName: "getAgentExtraData",
      args: [tokenId],
    })),
  });

  useEffect(() => {
    if (agentDataReads.data && agentExtraDataReads.data && allData?.tokenIds) {
      const traders: any = [];
      const investors: any = [];

      agentDataReads.data.forEach((agentData: any, index: number) => {
        if (!agentData || !agentExtraDataReads.data[index]) return;

        const extraData: any = agentExtraDataReads.data[index];
        const [name, description, model, userPromptURI] = agentData.result;
        const [agentType, riskLevel, investmentAmount, preferredAssets] =
          extraData.result;

        const agent = {
          tokenId: allData.tokenIds[index],
          name,
          description,
          model,
          userPromptURI,
          agentType,
          riskLevel,
          investmentAmount,
          preferredAssets,
        };

        if (agentType === 0) {
          traders.push(agent);
        } else {
          investors.push(agent);
        }
      });

      setActiveAgents({ traders, investors });
    }
  }, [agentDataReads.data, agentExtraDataReads.data, allData?.tokenIds]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Tabs defaultValue="history" className="w-full">
        <TabsList className="relative mb-6 w-[590px] justify-start rounded-xl bg-transparent">
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
            <TransactionHistory
              transactions={allData?.transactions || []}
              isLoading={isLoading}
            />
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
