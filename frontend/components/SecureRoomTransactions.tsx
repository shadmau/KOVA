import React, { useState, useEffect } from "react";
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Timer,
} from "lucide-react";
import { useRoom } from "@/context/room";

const SecureRoomTransactions = ({ timeRemaining }:any) => {
  const { roomState } = useRoom();
  const [displayedTransactions, setDisplayedTransactions] = useState<any[]>([]);

  const formatVolume = (volume:any) => {
    const num = parseFloat(volume);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  useEffect(() => {
    if (roomState?.transactions) {
      setDisplayedTransactions(roomState.transactions);
    }
  }, [roomState]);

  const getTransactionIcon = (type:any) => {
    switch (type) {
      case "swap":
        return <Activity className="h-5 w-5 text-blue-500" />;
      case "approve":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="flex flex-col space-y-4 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Timer className="h-5 w-5 text-blue-500 animate-pulse" />
          <span className="text-lg font-semibold">
            {Math.floor(timeRemaining / 60)}:
            {(timeRemaining % 60).toString().padStart(2, "0")}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 text-gray-500 animate-spin" />
          <span className="text-sm text-gray-500">Auto-refreshing</span>
        </div>
      </div>

      <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000"
          style={{ width: `${(timeRemaining / 120) * 100}%` }}
        />
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
        {displayedTransactions.map((tx, index) => (
          <div
            key={tx.txHash}
            className="flex items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100 transform transition-all duration-300 hover:scale-102 hover:shadow-md animate-fadeIn"
            style={{
              animationDelay: `${index * 150}ms`,
            }}
          >
            <div className="mr-3">{getTransactionIcon(tx.type)}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium capitalize text-sm">
                  {tx.type} Transaction
                </span>
                <span className="text-sm text-blue-600 font-medium">
                  {formatVolume(tx.volumeUSD)}
                </span>
              </div>
              <div className="text-xs text-gray-500 font-mono mt-1">
                {tx.txHash.slice(0, 6)}...{tx.txHash.slice(-4)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      {roomState && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Volume</span>
            <span className="font-medium text-blue-600">
              {formatVolume(roomState.totalVolumeUSD)}
            </span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-600">Transactions</span>
            <span className="font-medium text-blue-600">
              {roomState.transactions.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecureRoomTransactions;
