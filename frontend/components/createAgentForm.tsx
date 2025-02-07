import React, { useState } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { Controller, useForm } from "react-hook-form";
import contractAbi from "@/lib/contractAbis/AgentNFT.json";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Wallet,
  Target,
  BarChart3,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IPFSService } from "@/lib/ipfs";
import { RainbowButton } from "./ui/rainbow-button";
import TradingStrategyForm from "./TradingStrategyForm";

const SUPPORTED_ASSETS = [
  "BTC",
  "ETH",
  "USDT",
  "USDC",
  "BNB",
  "XRP",
  "SOL",
  "DOT",
] as const;

type SupportedAsset = (typeof SUPPORTED_ASSETS)[number];
interface TransactionStatusProps {
  isOpen: boolean;
  status: "loading" | "success" | "error" | null;
  hash?: string|null;
  onClose: () => void;
}

const TransactionStatus = ({
  isOpen,
  status,
  hash,
  onClose,
}: TransactionStatusProps) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>
          {status === "loading" && "Creating Agent..."}
          {status === "success" && "Agent Created Successfully!"}
          {status === "error" && "Error Creating Agent"}
        </DialogTitle>
      </DialogHeader>
      <div className="flex flex-col items-center justify-center p-6 space-y-4">
        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
            <p className="text-center text-gray-600">
              Please wait while your agent is being created...
            </p>
          </>
        )}
        {status === "success" && hash && (
          <>
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <p className="text-center text-gray-600">
              Your AI trading agent has been created successfully!
            </p>
            <a
              href={`https://sepolia.basescan.org/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline text-sm"
            >
              View on Basescan
            </a>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="h-12 w-12 text-red-500" />
            <p className="text-center text-gray-600">
              There was an error creating your agent. Please try again.
            </p>
          </>
        )}
        {status !== "loading" && (
          <Button onClick={onClose} className="mt-4">
            {status === "success" ? "Done" : "Close"}
          </Button>
        )}
      </div>
    </DialogContent>
  </Dialog>
);

interface CreateAgentFormProps {
  contractAddress: string;
}

interface FormData {
  agentRole: string;
  riskLevel: "Low" | "Medium" | "High";
  cryptoAssets: SupportedAsset;
  minInvestment: string;
  maxLossTolerance: number;
  expectedReturn: number;
  tradingStrategy: string;
  additionalNotes: string;
}

const CreateAgentForm = ({ contractAddress }: CreateAgentFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [txStatus, setTxStatus] = useState<
    "loading" | "success" | "error" | null
  >(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: confirmError,
  } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}`,
    confirmations: 1,
  });

  const { control, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      agentRole: "",
      riskLevel: "Low",
      cryptoAssets: "BTC",
      minInvestment: "",
      maxLossTolerance: 5,
      expectedReturn: 10,
      tradingStrategy: "",
      additionalNotes: "",
    },
  });

    const handleNextStep = (e: React.MouseEvent) => {
      e.preventDefault(); // Prevent form submission
      setCurrentStep(currentStep + 1);
    };

    const handlePreviousStep = (e: React.MouseEvent) => {
      e.preventDefault(); // Prevent form submission
      setCurrentStep(currentStep - 1);
    };
  React.useEffect(() => {
    if (txHash) {
      if (isConfirming) {
        setTxStatus("loading");
      } else if (isConfirmed) {
        setTxStatus("success");
      } else if (confirmError) {
        setTxStatus("error");
      }
    }
  }, [txHash, isConfirming, isConfirmed, confirmError]);

  const handleCloseStatus = () => {
    setTxStatus(null);
    setTxHash(null);
    if (isConfirmed) {
      reset();
      setCurrentStep(1);
    }
  };

  const generateUserPromptURI = async (formData: FormData) => {
    const promptData = {
      agentRole: formData.agentRole,
      riskLevel: formData.riskLevel,
      cryptoAssets: formData.cryptoAssets,
      minInvestment: formData.minInvestment,
      maxLossTolerance: formData.maxLossTolerance,
      expectedReturn: formData.expectedReturn,
      tradingStrategy: formData.tradingStrategy,
      additionalNotes: formData.additionalNotes,
    };
    return await IPFSService.uploadJSON(promptData);
  };

  const onSubmit = async (data: FormData) => {
    try {
      setTxStatus("loading");
      const userPromptURI = await generateUserPromptURI(data);
      const placeholderImageURI = "/api/placeholder/400/400";

      if (!writeContractAsync) {
        throw new Error("Write contract not initialized");
      }

      const tx = await writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: contractAbi,
        functionName: "mint",
        args: [
          {
            name: "AI Trading Agent",
            description: data.tradingStrategy,
            model: "gpt-4",
            userPromptURI,
            systemPromptURI: "",
            promptsEncrypted: false,
          },
          placeholderImageURI,
        ],
      });

      if (tx) {
        setTxHash(tx);
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error) {
      console.error("Error minting agent:", error);
      setTxStatus("error");
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="agentRole"
          control={control}
          render={({ field }) => (
            <>
              <div
                className={`p-6 rounded-lg bg-white-20 border cursor-pointer ${
                  field.value === "Investor"
                    ? "border-purple-600 bg-purple-300/20"
                    : "border-gray-300"
                }`}
                onClick={() => field.onChange("Investor")}
              >
                <Wallet
                  className={`w-6 h-6 mb-2 ${
                    field.value === "Investor"
                      ? "text-purple-500"
                      : "text-gray-500"
                  }`}
                />
                <h3
                  className={`font-medium   ${
                    field.value === "Investor"
                      ? "text-purple-600"
                      : "text-gray-500"
                  }`}
                >
                  Investor
                </h3>
                <p
                  className={`text-sm  ${
                    field.value === "Investor"
                      ? "text-purple-600"
                      : "text-gray-500"
                  }`}
                >
                  Long-term investment focus
                </p>
              </div>
              <div
                className={`p-6 rounded-lg border cursor-pointer ${
                  field.value === "Trader"
                    ? "border-purple-600 bg-purple-300/20 "
                    : "border-gray-300"
                }`}
                onClick={() => field.onChange("Trader")}
              >
                <BarChart3
                  className={`w-6 h-6 mb-2 ${
                    field.value === "Trader"
                      ? "text-purple-500"
                      : "text-gray-500"
                  }`}
                />
                <h3
                  className={`font-medium   ${
                    field.value === "Trader"
                      ? "text-purple-600"
                      : "text-gray-500"
                  }`}
                >
                  Trader
                </h3>
                <p
                  className={`text-sm  ${
                    field.value === "Trader"
                      ? "text-purple-600"
                      : "text-gray-500"
                  }`}
                >
                  Active trading strategies
                </p>
              </div>
            </>
          )}
        />
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-gray-500">Risk Level</Label>
          <Controller
            name="riskLevel"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-3 gap-4 mt-2">
                {["Low", "Medium", "High"].map((level) => (
                  <div
                    key={level}
                    className={`p-4 text-center font-semibold rounded-lg border cursor-pointer ${
                      field.value === level
                        ? "border-purple-600 bg-purple-300/20 text-purple-500"
                        : "border-gray-300 text-gray-500"
                    }`}
                    onClick={() => field.onChange(level)}
                  >
                    {level}
                  </div>
                ))}
              </div>
            )}
          />
        </div>

        <div>
          <Label className="text-gray-500">Preferred Assets</Label>
          <Controller
            name="cryptoAssets"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger
                  className="mt-2 border-gray-300 text-gray-500"
                  placeholder="Select Assets"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_ASSETS.map((asset) => (
                    <SelectItem key={asset} value={asset}>
                      {asset}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-gray-500">Minimum Investment</Label>
        <Controller
          name="minInvestment"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="number"
              placeholder="Enter amount"
              className="mt-2 text-gray-500"
            />
          )}
        />
      </div>

      <div>
        <Label className="text-gray-500">Maximum Loss Tolerance (%)</Label>
        <Controller
          name="maxLossTolerance"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Slider
                min={0}
                max={100}
                step={1}
                className=""
                value={[field.value]}
                onValueChange={([value]) => field.onChange(value)}
              />
              <span className="text-sm font-semibold text-gray-100">
                {field.value}%
              </span>
            </div>
          )}
        />
      </div>

      <div>
        <Label className="text-gray-500">Expected Return (%)</Label>
        <Controller
          name="expectedReturn"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Slider
                min={0}
                max={100}
                step={1}
                value={[field.value]}
                onValueChange={([value]) => field.onChange(value)}
              />
              <span className="text-sm text-gray-500 font-semibold">{field.value}%</span>
            </div>
          )}
        />
      </div>
    </div>
  );

const renderStep3 = () => (
  <div className="space-y-6">
    <div>
      <Label className="text-gray-500 font-semibold mb-2">Trading Strategy</Label>
      <Controller
        name="tradingStrategy"
        control={control}
        render={({ field }) => (
          <TradingStrategyForm onChange={field.onChange}  />
        )}
      />
    </div>
    <div>
      <Label className="text-gray-500 font-semibold">Additional Notes</Label>
      <Controller
        name="additionalNotes"
        control={control}
        render={({ field }) => (
          <Textarea
            {...field}
            placeholder="Any additional preferences or requirements"
            className="mt-2 min-h-[100px] text-gray-500"
          />
        )}
      />
    </div>
  </div>
);
  return (
    <div className="w-full max-w-4xl mx-auto bg-transparent pt-[2rem]">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {[
            { step: 1, icon: Wallet, label: "Basic Info" },
            { step: 2, icon: Target, label: "Investment Preferences" },
            { step: 3, icon: BarChart3, label: "Strategy" },
          ].map(({ step, icon: Icon }) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= step ? "bg-purple-600 text-white" : "bg-gray-200"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              {step < 3 && (
                <div
                  className={` w-80 h-1 mx-8 ${
                    currentStep > step ? "bg-purple-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-500 font-semibold">
          <span>Basic Info</span>
          <span>Investment Preferences</span>
          <span>Strategy</span>
        </div>
      </div>

      <Card className="backdrop-blur-md bg-white/20 dark:bg-black/30 border border-white/20 shadow-xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            <div className="flex justify-between mt-6">
              {currentStep > 1 && (
                              <RainbowButton
                                  
                  type="button"
                  onClick={handlePreviousStep}
                >
                  Back
                </RainbowButton>
              )}
              {currentStep < 3 ? (
                <RainbowButton
                  type="button"
                  onClick={handleNextStep}
                  className="ml-auto"
                >
                  Next
                </RainbowButton>
              ) : (
                <RainbowButton type="submit" className="ml-auto">
                  Find Matches
                </RainbowButton>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <TransactionStatus
        isOpen={!!txStatus}
        status={txStatus}
        hash={txHash}
        onClose={handleCloseStatus}
      />
    </div>
  );
};

export default CreateAgentForm;
