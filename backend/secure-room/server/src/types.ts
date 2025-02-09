export interface IAccountInfo {
  pkpAddress: string;
  evm: {
    chainId: number;
    address: string;
  }[];
  solana: {
    network: string;
    address: string;
  }[];
}

export interface IExecuteUserOpRequest {
  target: string;
  value: string;
  calldata: string;
}

export interface IExecuteUserOpResponse {
  userOperationHash: string;
  chainId: number;
}

export interface ITransactionReceipt {
  transactionHash?: string;
  transactionIndex?: number;
  blockHash?: string;
  blockNumber?: number;
  from?: string;
  to?: string;
  cumulativeGasUsed?: number;
  status?: string;
  gasUsed?: number;
  contractAddress?: string | null;
  logsBloom?: string;
  effectiveGasPrice?: number;
}

export interface ILog {
  data?: string;
  blockNumber?: number;
  blockHash?: string;
  transactionHash?: string;
  logIndex?: number;
  transactionIndex?: number;
  address?: string;
  topics?: string[];
}

export interface IUserOperationReceipt {
  userOpHash?: string;
  entryPoint?: string;
  sender?: string;
  nonce?: number;
  paymaster?: string;
  actualGasUsed?: number;
  actualGasCost?: number;
  success?: boolean;
  receipt?: ITransactionReceipt;
  logs?: ILog[];
}

export type VolumeData = {
  ticker: string;
  poolAddress: string;
  volume: string;
}

export type VolumePeriod = '1d' | '7d' | '30d';

export interface Tool {
  name: string;
  handler: (params?: any) => Promise<any>;
  description: string;
}

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface TransactionAction {
  type: TransactionType;
  txHash: string | null;
  status: TransactionStatus;
  volumeUSD: bigint;
  timestamp: number;
  error?: string;
}
export enum TransactionType {
  SWAP = "swap",
  APPROVE = "approve"
}
export enum TransactionStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  FAILED = "failed"
}

export interface RoomActionData {
  transactions: TransactionAction[];
  computationCount: number;
  isStopped: boolean;
}

export interface WalletData {
  roomId: number;
  walletAddress: string;
  cdpWalletData: string;
}

export interface FaucetWalletData {
  walletAddress: string;
  cdpWalletData: string;
}

export interface Participant {
  type: AgentType;
  constraints?: string;
  strategy?: string;
}
export enum AgentType {
  Trader = 0,
  Investor = 1
}