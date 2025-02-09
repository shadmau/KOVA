import { IERC20_ABI } from "../contracts/abis/IERC20.js";
import { AIAgentService } from "./agent.service.js";
import { BaseService } from "./base.service.js";
import { allPools } from "./const.js";
import { WalletService } from "./wallet.service.js";
import { Abi, encodeFunctionData, maxUint256 } from "viem";
import { TransactionStatus, TransactionType } from "../types.js";
import { IUNIV2_ABI } from "../contracts/abis/IUNIV2.js";

const requiredEnvVars = [
  "ROUTER_ADDRESS",
  "USDT_ADDRESS",
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`${varName} is not set`);
  }
});

const ROUTER_ADDRESS = process.env.ROUTER_ADDRESS!;
const USDT_ADDRESS = process.env.USDT_ADDRESS!;


export class SwapService extends BaseService {
  private static instance: SwapService;
  private isRunning: boolean = false;
  private walletService: WalletService;
  private constructor() {
    super();
    this.walletService = WalletService.getInstance();
  }

  public static getInstance(): SwapService {
    if (!SwapService.instance) {
      console.log("SwapService instance not found, creating new instance");
      SwapService.instance = new SwapService();
    }
    return SwapService.instance;
  }

  public async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    try {
      this.isRunning = true;
      console.log('SwapService started successfully');
    } catch (error) {
      console.error('Failed to start SwapService:', error);
      throw error;
    }
  }

  public async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      this.isRunning = false;
      console.log('SwapService stopped successfully');
    } catch (error) {
      console.error('Failed to stop SwapService:', error);
      throw error;
    }
  }

  public async swap(roomId: number, tokenAddress: string, amountIn: bigint): Promise<string> {
    if (!this.isRunning) {
      throw new Error('SwapService must be started before processing swaps');
    }
    console.log(`Room ${roomId}: Swapping ${amountIn} USDT for ${tokenAddress}...`);
    console.log(`Room ${roomId}: Retrieving wallet address...`);

    const { provider, walletAddress } = await this.walletService.getOrCreateWallet(roomId);

    try {

      const balance = await provider.readContract({
        address: USDT_ADDRESS as `0x${string}`,
        abi: IERC20_ABI as Abi,
        functionName: "balanceOf",
        args: [walletAddress],
      }) as bigint;

      if (balance < amountIn) {
        throw new Error(`Insufficient USDT balance. Required: ${amountIn}, Available: ${balance}`);
      }

      const currentAllowance = await provider.readContract({
        address: USDT_ADDRESS as `0x${string}`,
        abi: IERC20_ABI as Abi,
        functionName: "allowance",
        args: [walletAddress, ROUTER_ADDRESS],
      }) as bigint;

      if (currentAllowance < maxUint256) {
        console.log(`Room ${roomId}: Setting unlimited USDT allowance for Uniswap Router...`);
        const MAX_RETRIES = 3;
        let retryCount = 0;
        let approveTx: string | undefined;

        while (retryCount < MAX_RETRIES) {
          try {
            approveTx = await provider.sendTransaction({
              to: USDT_ADDRESS as `0x${string}`,
              data: encodeFunctionData({
                abi: IERC20_ABI as Abi,
                functionName: 'approve',
                args: [ROUTER_ADDRESS, maxUint256]
              })
            });

            if (approveTx) {
              console.log(`Room ${roomId}: USDT approval transaction sent: ${approveTx}`);
              break;
            }

            console.log(`Room ${roomId}: Attempt ${retryCount + 1} failed, retrying...`);
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between retries

          } catch (error) {
            console.log(`Room ${roomId}: Attempt ${retryCount + 1} failed with error:`, error);
            throw error;
          }
        }

        if (!approveTx) {
          throw new Error(`Room ${roomId}: Failed to execute approve after ${MAX_RETRIES} attempts`);
        }

        AIAgentService.getInstance().addOrUpdateTransactionAction(roomId.toString(), {
          txHash: approveTx,
          status: TransactionStatus.PENDING,
          volumeUSD: BigInt(0),
          type: TransactionType.APPROVE
        });

        const receipt = await provider.waitForTransactionReceipt(approveTx as `0x${string}`);
        AIAgentService.getInstance().addOrUpdateTransactionAction(roomId.toString(), {
          txHash: approveTx,
          status: TransactionStatus.CONFIRMED,
          volumeUSD: BigInt(0),
          type: TransactionType.APPROVE
        });
        console.log(`Room ${roomId}: USDT approval confirmed in block ${receipt.blockNumber}`);
      }

      // Define swap path: USDT -> Target Token
      const path = [USDT_ADDRESS, tokenAddress];

      // Query expected output amount from Uniswap
      const amountsOut = await provider.readContract({
        address: ROUTER_ADDRESS as `0x${string}`,
        abi: IUNIV2_ABI as Abi,
        functionName: "getAmountsOut",
        args: [amountIn, path],
      }) as Array<bigint>;

      if (amountsOut.length < 2) {
        throw new Error(`Room ${roomId}: Invalid amounts out returned from Uniswap`);
      }

      // Set minimum output amount with 50% slippage tolerance
      const amountOutMin = amountsOut[1] / BigInt(2); //? High slippage; only for testing
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour deadline

      // Execute USDT -> Token swap on Uniswap
      console.log(`Room ${roomId}: Swapping ${amountIn} USDT for minimum ${amountOutMin} tokens...`);
      const encodedData = encodeFunctionData({
        abi: IUNIV2_ABI,
        functionName: "swapExactTokensForTokens",
        args: [
          amountIn,
          amountOutMin,
          path,
          walletAddress,
          deadline
        ]
      });
      const MAX_RETRIES = 3;
      let retryCount = 0;
      let swapTx: string | undefined;

      while (retryCount < MAX_RETRIES) {
        try {
          swapTx = await provider.sendTransaction({
            to: ROUTER_ADDRESS as `0x${string}`,
            data: encodedData,
          });

          if (swapTx) {
            console.log(`Room ${roomId}: Swap transaction sent: ${swapTx}`);
            break;
          }

          console.log(`Room ${roomId}: Attempt ${retryCount + 1} failed, retrying...`);
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 1 second between retries

        } catch (error) {
          console.log(`Room ${roomId}: Attempt ${retryCount + 1} failed with error:`, error);
          throw error;
        }
      }

      if (!swapTx) {
        throw new Error(`Room ${roomId}: Failed to execute swap after ${MAX_RETRIES} attempts`);
      }
      AIAgentService.getInstance().addOrUpdateTransactionAction(roomId.toString(), {
        txHash: swapTx,
        status: TransactionStatus.PENDING,
        volumeUSD: amountIn,
        type: TransactionType.SWAP
      });
      console.log(`Room ${roomId}: Swap transaction sent: ${swapTx}`);
      return swapTx;

    } catch (error) {
      AIAgentService.getInstance().addOrUpdateTransactionAction(roomId.toString(), {
        txHash: null,
        status: TransactionStatus.FAILED,
        volumeUSD: amountIn,
        type: TransactionType.SWAP,
        error: error.message
      });

      console.error(`Room ${roomId}: Swap failed:`, error);
      throw error;
    }
  }

  public static getPoolByTicker(ticker: string): { poolAddress: string, poolName: string } {
    const pool = allPools.find(pool =>
      pool.ticker.toLowerCase() === ticker.toLowerCase()
    );
    if (!pool) {
      throw new Error(`Pool not found for ticker: ${ticker}`);
    }
    return { poolAddress: pool.poolAddress, poolName: pool.ticker };
  }
}







