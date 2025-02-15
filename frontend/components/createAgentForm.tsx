import React, { useEffect, useState } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
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
  Lock,
  Upload,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RainbowButton } from "./ui/rainbow-button";
import TradingStrategyForm from "./TradingStrategyForm";
import { PinataService } from "@/lib/pinata";
import AgentAvailabilityDialog from "./AgentAvailabilityDialog";
import { useRouter } from "next/navigation";
import InvestmentConstraint from "./InvestmentConstraint";

const SUPPORTED_ASSETS = ["USDT"] as const;
const MIN_INVESTMENT = 1;
const MAX_INVESTMENT = 100;
interface EncryptResponse {
  success: boolean;
  nillionUri: string;
}

type SupportedAsset = (typeof SUPPORTED_ASSETS)[number];
const RISK_LEVEL_MAPPING = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
} as const;
interface TransactionStatusProps {
  isOpen: boolean;
  status: "loading" | "success" | "error" | null;
  hash?: string | null;
  onClose: () => void;
}

const PrivacySelection = ({ value, onChange }:any) => (
  <div className="space-y-4">
    <Label className="text-gray-500">Data Privacy</Label>
    <div className="grid grid-cols-2 gap-4">
      <div
        className={`p-4 rounded-lg border cursor-pointer ${
          value === "public"
            ? "border-purple-600 bg-purple-300/20"
            : "border-gray-300"
        }`}
        onClick={() => onChange("public")}
      >
        <div className="flex items-center gap-2 mb-2">
          <Upload
            className={`w-5 h-5 ${
              value === "public" ? "text-purple-500" : "text-gray-500"
            }`}
          />
          <span
            className={`font-medium ${
              value === "public" ? "text-purple-600" : "text-gray-500"
            }`}
          >
            Public (IPFS)
          </span>
        </div>
        <p
          className={`text-sm ${
            value === "public" ? "text-purple-600" : "text-gray-500"
          }`}
        >
          Your data will be stored on IPFS and will be publicly accessible
        </p>
      </div>
      <div
        className={`p-4 rounded-lg border cursor-pointer ${
          value === "private"
            ? "border-purple-600 bg-purple-300/20"
            : "border-gray-300"
        }`}
        onClick={() => onChange("private")}
      >
        <div className="flex items-center gap-2 mb-2">
          <Lock
            className={`w-5 h-5 ${
              value === "private" ? "text-purple-500" : "text-gray-500"
            }`}
          />
          <span
            className={`font-medium ${
              value === "private" ? "text-purple-600" : "text-gray-500"
            }`}
          >
            Private (Nillion)
          </span>
        </div>
        <p
          className={`text-sm ${
            value === "private" ? "text-purple-600" : "text-gray-500"
          }`}
        >
          Your data will be encrypted and stored privately on Nillion
        </p>
      </div>
    </div>
  </div>
);

const TransactionStatus = ({
  isOpen,
  status,
  hash,
  onClose,
  onDone,
}: TransactionStatusProps & { onDone?: () => void }) => (
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
          <Button
            onClick={status === "success" ? onDone : onClose}
            className="mt-4"
          >
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
  riskLevel: keyof typeof RISK_LEVEL_MAPPING;
  agentName: string;
  cryptoAssets: SupportedAsset;
  minInvestment: string;
  maxInvestment: string;
  maxLossTolerance: number;
  expectedReturn: number;
  tradingStrategy: string;
  constraints: string;
  additionalNotes: string;
  tradingGoals: string;
}

const CreateAgentForm = ({ contractAddress }: CreateAgentFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);

  const [privacy, setPrivacy] = useState("public");
  const [isStepValid, setIsStepValid] = useState(false);
  const [txStatus, setTxStatus] = useState<
    "loading" | "success" | "error" | null
  >(null);
  const router = useRouter();
  const [mintedTokenId, setMintedTokenId] = useState<bigint | null>(null);
  const [showAvailabilityDialog, setShowAvailabilityDialog] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();
  const publicClient: any = usePublicClient();
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: confirmError,
  } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}`,
    confirmations: 1,
  });

  useEffect(() => {
    if (txHash) {
      if (isConfirming) {
        setTxStatus("loading");
      } else if (isConfirmed) {
        setTxStatus("success");
        // Query will automatically start once isConfirmed is true
      } else if (confirmError) {
        setTxStatus("error");
      }
    }
  }, [txHash, isConfirming, isConfirmed, confirmError]);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      agentRole: "Investor",
      riskLevel: "LOW",
      cryptoAssets: "USDT",
      agentName: "",
      minInvestment: "",
      maxInvestment: "",
      maxLossTolerance: 5,
      expectedReturn: 10,
      constraints: "",
      tradingStrategy: "",
      additionalNotes: "",
      tradingGoals: "",
    },
  });

  const agentRole = watch("agentRole");
  const watchedFields = {
    step1: watch(["agentRole", "riskLevel", "agentName", "tradingGoals"]),
    step2: watch(["minInvestment"]),
    step3: watch(["tradingStrategy", "constraints"]),
  };

  const handleNextStep = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    setCurrentStep(currentStep + 1);
  };

  const handlePreviousStep = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    setCurrentStep(currentStep - 1);
  };

  const handleDoneOnSuccess = () => {
    if (agentRole === "Investor" && mintedTokenId) {
      const maxInvestValue = watch("maxInvestment");
      const riskLevelValue = RISK_LEVEL_MAPPING[watch("riskLevel")];
      const queryParams = new URLSearchParams({
        maxInvestment: maxInvestValue,
        riskLevel: riskLevelValue.toString(),
        tokenId: mintedTokenId.toString(),
      });
      router.push(`/agents?${queryParams.toString()}`);
    } else if (agentRole === "Trader" && mintedTokenId) {
      setShowAvailabilityDialog(true);
    }

    setTxStatus(null);
    setTxHash(null);
    reset();
    setCurrentStep(1);
  };

  const handleCloseStatus = () => {
    setTxStatus(null);
    setTxHash(null);
  };

const formatDataForNillion = (formData: FormData) => {
  const basePromptData = {
    agentRole: formData.agentRole,
    tradingGoals: formData.tradingGoals,
    timestamp: Date.now(),
  };

  if (formData.agentRole === "Investor") {
    return {
      ...basePromptData,
      maxLossTolerance: formData.maxLossTolerance,
      expectedReturn: formData.expectedReturn,
      constraints: { $allot: formData.constraints },
    };
  } else {
    return {
      ...basePromptData,
      tradingStrategy: { $allot: formData.tradingStrategy },
    };
  }
};

const formatDataForIPFS = (formData: FormData) => {
  const basePromptData = {
    agentRole: formData.agentRole,
    tradingGoals: formData.tradingGoals,
    timestamp: Date.now(),
  };

  if (formData.agentRole === "Investor") {
    return {
      ...basePromptData,
      maxLossTolerance: formData.maxLossTolerance,
      expectedReturn: formData.expectedReturn,
      constraints: formData.constraints,
    };
  } else {
    return {
      ...basePromptData,
      tradingStrategy: formData.tradingStrategy,
    };
  }
};

const encryptWithNillion = async (data: any) => {
  try {
    const response = await fetch("https://schrank.xyz/api/nillion/encrypt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: data.agentRole.toLowerCase(),
        data: [data],
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to encrypt data with Nillion");
    }

    const result: EncryptResponse = await response.json();
    return result.nillionUri;
  } catch (error) {
    console.error("Nillion encryption error:", error);
    throw error;
  }
};

const generateUserPromptURI = async (formData: FormData) => {
  // Format data based on privacy selection
  const promptData =
    privacy === "private"
      ? formatDataForNillion(formData)
      : formatDataForIPFS(formData);

  // Use Nillion or IPFS based on privacy selection
  if (privacy === "private") {
    return await encryptWithNillion(promptData);
  } else {
    return await PinataService.uploadJSON(promptData);
  }
};


const onSubmit = async (data: FormData) => {
  try {
    setTxStatus("loading");
    let userPromptURI;

    try {
      const uri = await generateUserPromptURI(data);
      // For IPFS, prepend ipfs://, for Nillion use the URI as is
      userPromptURI = privacy === "private" ? uri : `ipfs://${uri}`;
    } catch (error) {
      console.error(
        privacy === "private"
          ? "Failed to encrypt with Nillion:"
          : "Failed to upload to IPFS:",
        error
      );
      setTxStatus("error");
      return;
    }

    if (!writeContractAsync) {
      throw new Error("Write contract not initialized");
    }

    const tx = await writeContractAsync({
      address: contractAddress as `0x${string}`,
      abi: contractAbi,
      functionName: "mint",
      args: [
        {
          name: data.agentName,
          description: data.additionalNotes,
          model: "Llama 3.3 70B",
          userPromptURI: userPromptURI,
          systemPromptURI: "",
          promptsEncrypted: privacy === "private",
          riskLevel: RISK_LEVEL_MAPPING[data.riskLevel],
          agentType: data.agentRole === "Investor" ? 1 : 0,
          investmentAmount:
            agentRole === "Investor" ? data.maxInvestment : data.minInvestment,
          preferredAssets: ["0xd1d6A8E7a1593e005FDBC08e978a389127277749"],
        },
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
  // Update useEffect watching for transaction confirmation:
  useEffect(() => {
    const getTokenId = async () => {
      if (!txHash || !isConfirmed) return;

      const receipt = await publicClient.getTransactionReceipt({
        hash: txHash as `0x${string}`,
      });
      console.log(receipt);
      const transferEvent = receipt.logs.find(
        (log: any) =>
          log.topics[0] ===
            "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef" && // Transfer event signature
          log.topics[1] ===
            "0x0000000000000000000000000000000000000000000000000000000000000000" // from zero address
      );

      if (transferEvent) {
        const tokenId = BigInt(transferEvent.topics[3]);
        setMintedTokenId(tokenId);
        if (agentRole === "Trader") {
          setShowAvailabilityDialog(true);
        }
      }
    };

    getTokenId();
  }, [txHash, isConfirmed, publicClient, agentRole]);

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
                  className={`font-medium ${
                    field.value === "Investor"
                      ? "text-purple-600"
                      : "text-gray-500"
                  }`}
                >
                  Investor
                </h3>
                <p
                  className={`text-sm ${
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
                    ? "border-purple-600 bg-purple-300/20"
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
                  className={`font-medium ${
                    field.value === "Trader"
                      ? "text-purple-600"
                      : "text-gray-500"
                  }`}
                >
                  Trader
                </h3>
                <p
                  className={`text-sm ${
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
                {["LOW", "MEDIUM", "HIGH"].map((level) => (
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
          <Label className="text-gray-500">Agent Name *</Label>
          <Controller
            name="agentName"
            control={control}
            rules={{ required: "Agent name is required" }}
            render={({ field }) => (
              <div className="mt-2">
                <Input
                  {...field}
                  placeholder="Enter agent name"
                  className="border-gray-300 text-gray-500"
                />
                {errors.agentName && (
                  <span className="text-red-500 text-sm mt-1">
                    {errors.agentName.message}
                  </span>
                )}
              </div>
            )}
          />
        </div>

        <div>
          <Label className="text-gray-500">Trading Goals</Label>
          <Controller
            name="tradingGoals"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="mt-2 border-gray-300 text-gray-500">
                  <SelectValue placeholder="Select Trading Goals" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short-term">Short-term Profit</SelectItem>
                  <SelectItem value="long-term">Long-term Growth</SelectItem>
                  <SelectItem value="balanced">Balanced Approach</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>
    </div>
  );
  useEffect(() => {
    const validateStep = () => {
      switch (currentStep) {
        case 1:
          const [role, risk, name, goals] = watchedFields.step1;
          setIsStepValid(!!role && !!risk && !!name && !!goals);
          break;
        case 2:
          const [minInv] = watchedFields.step2;
          const agentRole = watch("agentRole");
          if (agentRole === "Trader") {
            const investment = Number(minInv);
            setIsStepValid(
              investment >= MIN_INVESTMENT && investment <= MAX_INVESTMENT
            );
          }
          break;
        case 3:
          const [strategy, constraints] = watchedFields.step3;
          const isTrader = watch("agentRole") === "Trader";
          setIsStepValid(isTrader ? !!strategy : !!constraints);
          break;
      }
    };

    validateStep();
  }, [
    ...watchedFields.step1,
    ...watchedFields.step2,
    ...watchedFields.step3,
    currentStep,
  ]);

  const renderInvestmentField = () => {
    const agentRole = watch("agentRole");

    if (agentRole === "Trader") {
      return (
        <div className="space-y-2">
          <Label className="text-gray-500">Minimum Investment Amount</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              $
            </span>
            <Controller
              name="minInvestment"
              control={control}
              rules={{
                required: true,
                min: MIN_INVESTMENT,
                max: MAX_INVESTMENT,
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  className="pl-8 pr-4 border-gray-300"
                  placeholder={`Enter amount (${MIN_INVESTMENT}-${MAX_INVESTMENT} USDT)`}
                />
              )}
            />
          </div>
          <p className="text-yellow-500 text-sm">
            Minimum investment per trade is {MIN_INVESTMENT} USDT
          </p>
        </div>
      );
    }

    return null;
  };

  // Update renderStep2 to use the new investment field
  const renderStep2 = () => (
    <div className="space-y-6">
      {renderInvestmentField()}
      {watch("agentRole") === "Investor" && (
        <>
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
                    value={[field.value]}
                    onValueChange={([value]) => field.onChange(value)}
                  />
                  <span className="text-sm font-semibold text-gray-500">
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
                  <span className="text-sm text-gray-500 font-semibold">
                    {field.value}%
                  </span>
                </div>
              )}
            />
          </div>
        </>
      )}
    </div>
  );

  // Update the form buttons to use isStepValid
  const renderFormButtons = () => (
    <div className="flex justify-between mt-6">
      {currentStep > 1 && (
        <RainbowButton type="button" onClick={handlePreviousStep}>
          Back
        </RainbowButton>
      )}
      {currentStep < 3 ? (
        <RainbowButton
          type="button"
          onClick={handleNextStep}
          className="ml-auto"
          disabled={!isStepValid}
        >
          Next
        </RainbowButton>
      ) : (
        <RainbowButton
          type="submit"
          className="ml-auto"
          disabled={!isStepValid}
        >
          Submit
        </RainbowButton>
      )}
    </div>
  );

  const renderStep3 = () => {
    const agentRole = watch("agentRole");

    return (
      <div className="space-y-6">
        {agentRole === "Investor" ? (
          <Controller
            name="constraints"
            control={control}
            render={({ field }) => (
              <InvestmentConstraint
                onChange={({ constraint, maxInvestment }:any) => {
                  field.onChange(constraint);
                  setValue("maxInvestment", maxInvestment);
                }}
              />
            )}
          />
        ) : (
          <>
            <Controller
              name="tradingStrategy"
              control={control}
              render={({ field }) => (
                <TradingStrategyForm onChange={field.onChange} />
              )}
            />
          </>
        )}
        <PrivacySelection value={privacy} onChange={setPrivacy} />

        <div>
          <Label className="text-gray-500 font-semibold">
            Additional Notes
          </Label>
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
  };

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
                  currentStep >= step
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200"
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
          <span>{agentRole==="Investor"?"Constraints":"Strategy"}</span>
        </div>
      </div>

      <Card className="backdrop-blur-md bg-white/20 dark:bg-black/30 border border-white/20 shadow-xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {renderFormButtons()}
          </form>
        </CardContent>
      </Card>

      <TransactionStatus
        isOpen={!!txStatus}
        status={txStatus}
        hash={txHash}
        onClose={handleCloseStatus}
        onDone={handleDoneOnSuccess}
      />
      <AgentAvailabilityDialog
        isOpen={showAvailabilityDialog}
        tokenId={mintedTokenId!}
        contractAddress={contractAddress}
        onClose={() => {
          setShowAvailabilityDialog(false);
          setMintedTokenId(null);
        }}
      />
    </div>
  );
};

export default CreateAgentForm;
