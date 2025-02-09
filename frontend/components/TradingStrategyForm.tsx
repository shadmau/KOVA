import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { RainbowButton } from "./ui/rainbow-button";

interface TradingStrategyFormProps {
  onChange: (value: string) => void;
}

interface Strategy {
  id: number;
  action: string;
  strategyType: string;
  assetType: string;
  amount: string;
  condition: string;
  frequency: string;
}
const FIXED_ASSETS = [
  {
    value: "cbBTC",
    label: "cbBTC",
    imageUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/32731.png",
  },
  {
    value: "BRETT",
    label: "BRETT",
    imageUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/31343.png",
  },
  {
    value: "VIRTUAL",
    label: "VIRTUAL",
    imageUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/29420.png",
  },
  {
    value: "AERO",
    label: "AERO",
    imageUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/29270.png",
  },
  {
    value: "AIXBT",
    label: "AIXBT",
    imageUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/34103.png",
  },
  {
    value: "DOGE",
    label: "DOGE",
    imageUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/74.png",
  },
  {
    value: "AAVE",
    label: "AAVE",
    imageUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/7278.png",
  },
  {
    value: "MIGGLES",
    label: "MIGGLES",
    imageUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/32289.png",
  },
  {
    value: "WBTC",
    label: "WBTC",
    imageUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/3717.png",
  },
] as const;

const VOLUME_BASED_ASSETS = [
  {
    value: "1st highest volume coin",
    label: "1st highest volume coin",
    imageUrl: null,
  },
  {
    value: "2nd highest volume coin",
    label: "2nd highest volume coin",
    imageUrl: null,
  },
  {
    value: "3rd highest volume coin",
    label: "3rd highest volume coin",
    imageUrl: null,
  },
] as const;

// Custom SelectValue component for asset display
const AssetSelectValue = ({ value }: { value: string }) => {
  const asset = [...FIXED_ASSETS, ...VOLUME_BASED_ASSETS].find(
    (a) => a.value === value
  );

  if (!asset) return <span className="text-gray-500">Select asset</span>;

  return (
    <div className="flex items-center gap-2">
      {asset.imageUrl && (
        <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
          <img
            src={asset.imageUrl}
            alt={`${asset.label} Logo`}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <span>{asset.label}</span>
    </div>
  );
};

// Custom SelectItem component for asset options
const AssetSelectItem = ({
  asset,
}: {
  asset: (typeof FIXED_ASSETS)[number] | (typeof VOLUME_BASED_ASSETS)[number];
}) => (
  <SelectItem value={asset.value} className="flex items-center gap-2 py-2">
    <div className="flex items-center gap-2 w-full">
      {asset.imageUrl && (
        <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
          <img
            src={asset.imageUrl}
            alt={`${asset.label} Logo`}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <span className="flex-grow">{asset.label}</span>
    </div>
  </SelectItem>
);

interface TradingStrategyFormProps {
  onChange: (value: string) => void;
}

const TradingStrategyForm = ({ onChange }: TradingStrategyFormProps) => {
  const [nextId, setNextId] = useState(1);
  const [strategies, setStrategies] = useState<Strategy[]>([
    {
      id: 0,
      action: "",
      strategyType: "",
      assetType: "",
      amount: "",
      condition: "",
      frequency: "",
    },
  ]);

  const getPreviewText = (strategy: Strategy) => {
    if (!strategy.action || !strategy.strategyType) return "";

    let preview = "";

    if (strategy.strategyType === "Volume-Based") {
      preview = `${strategy.action} the ${
        strategy.assetType || "[asset]"
      } in the last ${strategy.condition || "[period]"} for ${
        strategy.amount || "0"
      } USDT every ${strategy.frequency || "[frequency]"}`;
    } else if (strategy.strategyType === "Fixed Asset") {
      preview = `${strategy.action} ${strategy.amount || "0"} USDT worth of ${
        strategy.assetType || "[asset]"
      }`;
    } else if (strategy.strategyType === "Time-Based") {
      preview = `${strategy.action} ${strategy.amount || "0"} USDT worth of ${
        strategy.assetType || "[asset]"
      } every ${strategy.frequency || "[frequency]"}`;
    }

    return preview;
  };

  useEffect(() => {
    const strategiesText = strategies
      .map((strategy) => getPreviewText(strategy))
      .filter((text) => text)
      .join(" and ");
    onChange(strategiesText);
  }, [strategies, onChange]);

  const handleStrategyChange = (
    id: number,
    field: keyof Strategy,
    value: string,
  ) => {
    setStrategies((prevStrategies) =>
      prevStrategies.map((strategy) =>
        strategy.id === id ? { ...strategy, [field]: value } : strategy,
      ),
    );
  };

  const addStrategy = () => {
    if (strategies.length < 2) {
      setStrategies((prevStrategies) => [
        ...prevStrategies,
        {
          id: nextId,
          action: "",
          strategyType: "",
          assetType: "",
          amount: "",
          condition: "",
          frequency: "",
        },
      ]);
      setNextId((prev) => prev + 1);
    }
  };

  const removeStrategy = (id: number) => {
    setStrategies((prevStrategies) =>
      prevStrategies.filter((strategy) => strategy.id !== id),
    );
  };

  return (
    <div className="space-y-6">
      {strategies.map((strategy, index) => (
        <Card key={strategy.id} className="bg-white/5 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-500">
                Trading Strategy {index + 1}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label className="text-gray-500">Action</Label>
                <Select
                  value={strategy.action}
                  onValueChange={(value) =>
                    handleStrategyChange(strategy.id, "action", value)
                  }
                >
                  <SelectTrigger className="focus:border-purple-400 border-gray-300">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Buy">Buy</SelectItem>
                    <SelectItem value="Sell">Sell</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-500">Strategy Type</Label>
                <Select
                  value={strategy.strategyType}
                  onValueChange={(value) =>
                    handleStrategyChange(strategy.id, "strategyType", value)
                  }
                >
                  <SelectTrigger className="focus:border-purple-400 border-gray-300">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Volume-Based">Volume-Based</SelectItem>
                    <SelectItem value="Fixed Asset">Fixed Asset</SelectItem>
                    <SelectItem value="Time-Based">Time-Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-500">Asset Type</Label>
                <Select
                  value={strategy.assetType}
                  onValueChange={(value) =>
                    handleStrategyChange(strategy.id, "assetType", value)
                  }
                >
                  <SelectTrigger className="focus:border-purple-400 border-gray-300">
                    <AssetSelectValue value={strategy.assetType} />
                  </SelectTrigger>
                  <SelectContent>
                    {strategy.strategyType === "Volume-Based"
                      ? VOLUME_BASED_ASSETS.map((asset) => (
                          <AssetSelectItem key={asset.value} asset={asset} />
                        ))
                      : FIXED_ASSETS.map((asset) => (
                          <AssetSelectItem key={asset.value} asset={asset} />
                        ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-500">Amount (USDT)</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={strategy.amount}
                  onChange={(e) =>
                    handleStrategyChange(strategy.id, "amount", e.target.value)
                  }
                  className="focus:border-purple-400 border-gray-300"
                />
              </div>

              {strategy.strategyType === "Volume-Based" && (
                <div>
                  <Label className="text-gray-500">Condition</Label>
                  <Select
                    value={strategy.condition}
                    onValueChange={(value) =>
                      handleStrategyChange(strategy.id, "condition", value)
                    }
                  >
                    <SelectTrigger className="focus:border-purple-400 border-gray-300">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1d">1 day</SelectItem>
                      <SelectItem value="7d">7 days</SelectItem>
                      <SelectItem value="30d">30 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(strategy.strategyType === "Volume-Based" ||
                strategy.strategyType === "Time-Based") && (
                <div>
                  <Label className="text-gray-500">Frequency</Label>
                  <Select
                    value={strategy.frequency}
                    onValueChange={(value) =>
                      handleStrategyChange(strategy.id, "frequency", value)
                    }
                  >
                    <SelectTrigger className="focus:border-purple-400 border-gray-300">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1s">Every 1 second</SelectItem>
                      <SelectItem value="10s">Every 10 seconds</SelectItem>
                      <SelectItem value="60s">Every 60 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="mt-4 p-4 border border-purple-400 bg-purple-300/20 rounded-lg">
              <Label className="text-gray-500">Strategy Preview</Label>
              <p className="mt-2 text-purple-500">{getPreviewText(strategy)}</p>
            </div>

            {strategies.length > 1 && (
              <Button
                variant="outline"
                onClick={() => removeStrategy(strategy.id)}
                className="mt-4"
              >
                Remove Strategy
              </Button>
            )}
          </CardContent>
        </Card>
      ))}

      {strategies.length < 2 && (
        <RainbowButton
          onClick={addStrategy}
          className="w-[30%] bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Second Strategy
        </RainbowButton>
      )}
    </div>
  );
};

export default TradingStrategyForm;
