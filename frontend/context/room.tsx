import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Activity, CheckCircle2, AlertCircle } from "lucide-react";

interface Transaction {
  txHash: string;
  status: string;
  volumeUSD: string;
  type: string;
  timestamp: number;
}

interface RoomState {
  totalVolumeUSD: string;
  computationCount: number;
  isStopped: boolean;
  transactions: Transaction[];
}

interface RoomContextType {
  currentRoomId: string | null;
  setCurrentRoomId: (roomId: string | null) => void;
  roomState: RoomState | null;
}

const RoomContext = createContext<RoomContextType>({
  currentRoomId: null,
  setCurrentRoomId: () => {},
  roomState: null,
});

const safeApiCall = async (apiCall: () => Promise<any>) => {
  try {
    const response = await apiCall();
    return response;
  } catch (error) {
    console.error("API call failed:", error);
    return null;
  }
};

const formatVolume = (volume: string) => {
  const num = parseFloat(volume);
  if (num < 1) return num.toFixed(6);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
};

const TransactionToast = ({ transaction }: { transaction: Transaction }) => {
  const getIcon = () => {
    switch (transaction.type) {
      case "swap":
        return <Activity className="h-5 w-5 text-blue-500" />;
      case "approve":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="flex items-center gap-3">
      {getIcon()}
      <div className="flex flex-col">
        <span className="font-medium capitalize">
          {transaction.type} Transaction
        </span>
        <span className="text-sm text-gray-500">
          Volume: {formatVolume(transaction.volumeUSD)}
        </span>
        <span className="text-xs text-gray-400 font-mono">
          {transaction.txHash.slice(0, 6)}...{transaction.txHash.slice(-4)}
        </span>
      </div>
    </div>
  );
};

export const RoomProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [seenTransactions, setSeenTransactions] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let initialTimeoutId: NodeJS.Timeout;

    const fetchRoomActions = async () => {
      if (!currentRoomId) return;

      const response = await safeApiCall(() =>
        axios.get(
          `https://schrank.xyz/api/secure-room/actions/${currentRoomId}`
        )
      );

      if (response?.data) {
        const newState = response.data;
        setRoomState(newState);

        // Show notifications for new transactions
        newState.transactions.forEach((tx: Transaction) => {
          if (!seenTransactions.has(tx.txHash)) {
            toast.custom(
              (t:any) => (
                <div key={t} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-md border border-gray-200 dark:border-gray-700">
                  <TransactionToast transaction={tx} />
                </div>
              ),
              {
                duration: 5000,
                position: "top-right",
              }
            );
            setSeenTransactions((prev:any) => new Set([...prev, tx.txHash]));
          }
        });

        if (newState.isStopped) {
          toast.success("Room computation completed!", {
            description: `Total volume: ${formatVolume(
              newState.totalVolumeUSD
            )}`,
            duration: 5000,
          });
          setCurrentRoomId(null);
        }
      }
    };

    if (currentRoomId) {
      // Add initial delay before first API call
      initialTimeoutId = setTimeout(() => {
        fetchRoomActions();
        // Start polling interval after first successful call
        intervalId = setInterval(fetchRoomActions, 10000);
      }, 3000); // Wait 3 seconds before making the first call
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (initialTimeoutId) clearTimeout(initialTimeoutId);
    };
  }, [currentRoomId, seenTransactions]);

  return (
    <RoomContext.Provider
      value={{ currentRoomId, setCurrentRoomId, roomState }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => useContext(RoomContext);
