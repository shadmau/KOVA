import fs from 'fs';
import path from 'path';
import { BaseService } from "./base.service.js";
import { CdpWalletProvider } from "@coinbase/agentkit";
import { encodeFunctionData, formatUnits, parseEther } from 'viem';
import { IERC20_ABI } from '../contracts/abis/IERC20.js';
import { FaucetWalletData, WalletData } from '../types.js';
import dotenv from "dotenv";
dotenv.config();

const requiredEnvVars = [
    "ETH_FAUCET_AMOUNT",
    "TOKEN_FAUCET_AMOUNT",
    "TOKEN_ADDRESS",
    "WALLETS_FILE_NAME",
    "FAUCET_WALLET_FILE_NAME",
    "CB_API_KEY_NAME",
    "CB_API_KEY_PRIVATE_KEY",
    "NETWORK_ID",
    "MINIMUM_FAUCET_AMOUNT",
  ];
  
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      throw new Error(`${varName} is not set`);
    }
  });
  const ETH_FAUCET_AMOUNT = process.env.ETH_FAUCET_AMOUNT;
  const TOKEN_FAUCET_AMOUNT = parseEther(process.env.TOKEN_FAUCET_AMOUNT!);
  const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;
  const WALLETS_FILE_NAME = process.env.WALLETS_FILE_NAME;
  const FAUCET_WALLET_FILE_NAME = process.env.FAUCET_WALLET_FILE_NAME;
  const CB_API_KEY_NAME = process.env.CB_API_KEY_NAME;
  const CB_API_KEY_PRIVATE_KEY = process.env.CB_API_KEY_PRIVATE_KEY;
  const NETWORK_ID = process.env.NETWORK_ID;
  const MINIMUM_FAUCET_AMOUNT = process.env.MINIMUM_FAUCET_AMOUNT;
  

export class WalletService extends BaseService {
    private static instance: WalletService;
    private isRunning: boolean = false;
    private readonly walletsFilePath: string;
    private readonly faucetWalletFilePath: string;
    private wallets: WalletData[] = [];
    private faucetProvider: CdpWalletProvider | null = null;
    private faucetQueue: {
        type: 'native' | 'token';
        address: string;
        resolve: (value: any) => void;
        tokenAddress?: string;
        amount?: bigint;
    }[] = [];
    private isProcessingFaucet: boolean = false;

    private constructor() {
        super();
        this.walletsFilePath = path.join(process.cwd(), WALLETS_FILE_NAME!);
        this.faucetWalletFilePath = path.join(process.cwd(), FAUCET_WALLET_FILE_NAME!);
        this.loadWallets();
    }

    public static getInstance(): WalletService {
        if (!WalletService.instance) {
            console.log("WalletService instance not found, creating new instance");
            WalletService.instance = new WalletService();
        }
        return WalletService.instance;
    }

    private loadWallets(): void {
        try {
            if (fs.existsSync(this.walletsFilePath)) {
                const data = fs.readFileSync(this.walletsFilePath, 'utf8');
                this.wallets = JSON.parse(data);
                console.log("✅ Wallets loaded successfully");
            } else {
                this.wallets = [];
                this.saveWallets();
                console.log("✅ Created new wallets file");
            }
        } catch (error) {
            console.error("❌ Error loading wallets:", error);
            this.wallets = [];
        }
    }



    private async loadOrCreateFaucetWallet(): Promise<void> {
        try {
            let faucetWalletData: FaucetWalletData | null = null;

            if (fs.existsSync(this.faucetWalletFilePath)) {
                const data = fs.readFileSync(this.faucetWalletFilePath, 'utf8');
                faucetWalletData = JSON.parse(data);
                console.log("✅ Faucet wallet loaded successfully: ", faucetWalletData!.walletAddress);
            }

            if (faucetWalletData) {
                this.faucetProvider = await CdpWalletProvider.configureWithWallet({
                    apiKeyName: CB_API_KEY_NAME,
                    apiKeyPrivateKey: CB_API_KEY_PRIVATE_KEY,
                    networkId: NETWORK_ID,
                    cdpWalletData: faucetWalletData.cdpWalletData
                });
            } else {

                this.faucetProvider = await CdpWalletProvider.configureWithWallet({
                    apiKeyName: CB_API_KEY_NAME,
                    apiKeyPrivateKey: CB_API_KEY_PRIVATE_KEY,
                    networkId: NETWORK_ID,
                });

                const walletData = await this.faucetProvider.exportWallet();
                const faucetData: FaucetWalletData = {
                    walletAddress: this.faucetProvider.getAddress(),
                    cdpWalletData: JSON.stringify(walletData)
                };

                fs.writeFileSync(this.faucetWalletFilePath, JSON.stringify(faucetData, null, 2));
                console.log("✅ Created new faucet wallet");
            }
        } catch (error) {
            console.error("❌ Error setting up faucet wallet:", error);
            throw error;
        }
    }

    private saveWallets(): void {
        try {
            fs.writeFileSync(this.walletsFilePath, JSON.stringify(this.wallets, null, 2));
            console.log("✅ Wallets saved successfully");
        } catch (error) {
            console.error("❌ Error saving wallets:", error);
        }
    }

    private async processFaucetQueue(): Promise<void> {
        if (this.isProcessingFaucet || this.faucetQueue.length === 0) return;

        this.isProcessingFaucet = true;
        try {

            const request = this.faucetQueue.shift()!;
            try {
                let tx;
                if (request.type === 'native') {
                    tx = await this.faucetProvider!.nativeTransfer(
                        request.address as `0x${string}`,
                        ETH_FAUCET_AMOUNT!
                    );
                } else {
                    tx = await this.faucetProvider!.sendTransaction({
                        to: request.tokenAddress as `0x${string}`,
                        data: encodeFunctionData({
                            abi: IERC20_ABI,
                            functionName: "transfer",
                            args: [request.address as `0x${string}`, request.amount!],
                        }) as any
                    });
                }
                request.resolve({ success: true, tx });
            } catch (error) {
                request.resolve({ success: false, error });
            }
            await new Promise(resolve => setTimeout(resolve, 1400)); // Rate limit between requests
        } finally {
            this.isProcessingFaucet = false;
            if (this.faucetQueue.length > 0) {
                setTimeout(() => this.processFaucetQueue(), 100);
            }
        }
    }

    public async faucetEth(address: string): Promise<{ success: boolean; tx?: string; error?: any }> {
        console.log("Received faucet request for address:", address);
        const wallet = this.wallets.find(w => w.walletAddress.toLowerCase() === address.toLowerCase());
        if (!wallet) {
            return { success: false, error: "Address not found in wallets" };
        }

        console.log("Faucet queue length:", this.faucetQueue.length);
        if (this.faucetQueue.length > 10) {
            return { success: false, error: "Faucet queue is full" };
        }
        const faucetBalance = await this.faucetProvider!.getBalance();
        console.log("Faucet balance:", formatUnits(faucetBalance, 18));
        if (faucetBalance < parseEther(MINIMUM_FAUCET_AMOUNT!)) {
            return { success: false, error: "Faucet balance is less than 0.01 ETH" };
        }

        return new Promise((resolve) => {
            this.faucetQueue.push({ type: 'native', address, resolve });
            this.processFaucetQueue();
        });
    }

    public async faucetToken(toAddress: string, tokenAddress: string = TOKEN_ADDRESS!, amount: bigint = TOKEN_FAUCET_AMOUNT!    ): Promise<{ success: boolean; tx?: string; error?: any }> {

        if (this.faucetQueue.length > 10) {
            return { success: false, error: "Faucet queue is full" };
        }

        return new Promise((resolve) => {
            this.faucetQueue.push({
                type: 'token',
                address: toAddress,
                tokenAddress,
                amount,
                resolve
            });
            this.processFaucetQueue();
        });
    }

    public async getWalletAddress(roomId: number): Promise<string | null> {
        const existingWallet = this.wallets.find(w => w.roomId === parseInt(roomId.toString()));
        return existingWallet?.walletAddress ?? null;
    }

    public async getOrCreateWallet(roomId: number): Promise<{ provider: CdpWalletProvider; walletAddress: string }> {

        roomId = parseInt(roomId.toString());

        const existingWallet = this.wallets.find(w => w.roomId === roomId);

        if (existingWallet) {
            console.log(`✅ Found existing wallet for room ${roomId}`);
            const provider = await CdpWalletProvider.configureWithWallet({
                apiKeyName: CB_API_KEY_NAME,
                apiKeyPrivateKey: CB_API_KEY_PRIVATE_KEY,
                networkId: NETWORK_ID,
                cdpWalletData: existingWallet.cdpWalletData
            });

            return {
                provider,
                walletAddress: existingWallet.walletAddress
            };
        }

        console.log(`Creating new wallet for room ${roomId}`);
        const provider = await CdpWalletProvider.configureWithWallet({
            apiKeyName: CB_API_KEY_NAME,
            apiKeyPrivateKey: CB_API_KEY_PRIVATE_KEY,
            networkId: NETWORK_ID,
        });

        const walletAddress = provider.getAddress();
        const walletData = await provider.exportWallet();

        this.wallets.push({
            roomId,
            walletAddress,
            cdpWalletData: JSON.stringify(walletData)
        });
        this.saveWallets();

        return {
            provider,
            walletAddress
        };
    }

    public async isFaucetWalletEmpty(): Promise<boolean> {
        if (!this.faucetProvider) { return true }
        const balance = await this.faucetProvider.getBalance();
        console.log(`Faucet wallet ${this.faucetProvider.getAddress()} balance: ${formatUnits(balance, 18)}`);
        if (balance <= parseEther(MINIMUM_FAUCET_AMOUNT!)) { return false }
        return true;
    }

    public async start(): Promise<void> {
        if (this.isRunning) {
            return;
        }

        try {
            this.loadWallets();
            await this.loadOrCreateFaucetWallet();
            if (!await this.isFaucetWalletEmpty()) {
                console.log("🔴 Faucet wallet is empty or below threshold. Please add funds to the faucet wallet.");
                throw new Error("Faucet wallet is empty or below threshold. Please add funds to the faucet wallet.");
            }
            this.isRunning = true;
            console.log('WalletService started successfully');
        } catch (error) {
            console.error('Failed to start WalletService:', error);
            throw error;
        }
    }

    public async stop(): Promise<void> {
        if (!this.isRunning) {
            return;
        }

        try {
            this.saveWallets();
            this.isRunning = false;
            console.log('WalletService stopped successfully');
        } catch (error) {
            console.error('Failed to stop WalletService:', error);
            throw error;
        }
    }
}
