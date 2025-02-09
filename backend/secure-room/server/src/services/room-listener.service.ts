import { BaseService } from "./base.service.js";
import { ethers } from "ethers";
import { AIAgentService } from "./agent.service.js";
import { WalletService } from "./wallet.service.js";
import { Message } from "../types.js";
import { IROOM_ABI } from "../contracts/abis/IROOM.js";
import { SYSTEM_PROMPT } from "./const.js";


const requiredEnvVars = [
    "SECURE_ROOM_CONTRACT_ADDRESS",
    "RPC_URL",
  ];
  
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      throw new Error(`${varName} is not set`);
    }
  });

const SECURE_ROOM_CONTRACT_ADDRESS = process.env.SECURE_ROOM_CONTRACT_ADDRESS;
const DEMO = process.env.DEMO === "true";
const RPC_URL = process.env.RPC_URL;

export class ContractListenerService extends BaseService {
    private static instance: ContractListenerService;
    private provider: ethers.JsonRpcProvider;
    private roomContract: ethers.Contract;
    private aiService: AIAgentService;
    private isRunning: boolean = false;
    private walletService: WalletService;
    private constructor() {
        super();
        this.provider = new ethers.JsonRpcProvider(RPC_URL!);
        this.roomContract = new ethers.Contract(
            SECURE_ROOM_CONTRACT_ADDRESS!,
            IROOM_ABI,
            this.provider
        );


        this.aiService = AIAgentService.getInstance();
        this.walletService = WalletService.getInstance();
    }

    public static getInstance(): ContractListenerService {
        if (!ContractListenerService.instance) {
            ContractListenerService.instance = new ContractListenerService();
        }
        return ContractListenerService.instance;
    }
    public async start(): Promise<void> {
        if (this.isRunning) return;

        try {

            const initialMessages: Message[] = [
                {
                    role: "system",
                    content: SYSTEM_PROMPT,
                },
                {
                    role: "user",
                    content: "start"
                },

            ];
            console.log("initialMessages", initialMessages);


            // Listen to Room creation events:
            console.log(`Listening to RoomCreated events on ${SECURE_ROOM_CONTRACT_ADDRESS}`);
            this.roomContract.on("RoomCreated", async (roomId: bigint, creator: string,) => {
                console.log('\n=== New Room Event ===');
                console.log(`📋 Room ID: ${roomId}`);
                console.log(`👤 Creator: ${creator}`);

                try {

                    console.log('\n🔐 Setting up Room Security');
                    console.log(`⏳ Creating Agent Wallet for Room ${roomId}`);
                    const result = await this.walletService.getOrCreateWallet(parseInt(roomId.toString()));

                    console.log('✅ Wallet Setup Complete:');
                    console.log(`   📬 Address: ${result.walletAddress}`);

                    console.log('\n💧 Initiating Token Drip');
                    let ethDripSuccess = false;
                    let ethDripAttempts = 0;
                    const maxAttempts = 3;
                    
                    while (!ethDripSuccess && ethDripAttempts < maxAttempts) {
                        const ethDripResult = await this.walletService.faucetEth(result.walletAddress);
                        if (!ethDripResult.tx) {
                            console.log(`❌ ETH drip attempt ${ethDripAttempts + 1} failed: ${JSON.stringify(ethDripResult)}`);
                            ethDripAttempts++;
                            if (ethDripAttempts < maxAttempts) {
                                console.log('Waiting 5 seconds before retry...');
                                await new Promise(resolve => setTimeout(resolve, 5000));
                            }
                        } else {
                            console.log('✅ ETH drip completed: TX: ', ethDripResult.tx);
                            ethDripSuccess = true;
                        }
                    }

                    if (!ethDripSuccess) {
                        throw new Error('ETH drip failed after maximum retry attempts');
                    }

                    if (DEMO) {
                        console.log('\n💧 Dripping USDT Token');
                        let tokenDripSuccess = false;
                        let tokenDripAttempts = 0;

                        while (!tokenDripSuccess && tokenDripAttempts < maxAttempts) {
                            const tokenDripResult = await this.walletService.faucetToken(result.walletAddress);
                            if (!tokenDripResult.tx) {
                                console.log(`❌ Token drip attempt ${tokenDripAttempts + 1} failed`);
                                tokenDripAttempts++;
                                if (tokenDripAttempts < maxAttempts) {
                                    console.log('Waiting 5 seconds before retry...');
                                    await new Promise(resolve => setTimeout(resolve, 5000));
                                }
                            } else {
                                console.log('✅ Token drip completed: TX: ', tokenDripResult.tx);
                                tokenDripSuccess = true;
                            }
                        }

                        if (!tokenDripSuccess) {
                            throw new Error('Token drip failed after maximum retry attempts');
                        }
                    }
                } catch (error) {
                    console.error('❌ Room Setup Failed:', error);
                    console.error('   Details:', {
                        roomId: roomId.toString(),
                        error: error.message
                    });
                }
            })

            //Listen to room full events:
            console.log(`Listening to RoomJoined events on ${SECURE_ROOM_CONTRACT_ADDRESS}`);
            this.roomContract.on("RoomJoined", async (roomId: bigint) => {
                let requests = 0;
                const maxRequests = 6;
                while (requests < maxRequests) {
                    if (this.aiService.getRoomActionData(roomId.toString())?.isStopped) {
                        console.log(`Contract Listener Service: Room ${roomId} is stopped, skipping...`);
                        return;
                    }
                    let result = null;
                    if (requests == 0) {
                        result = await this.aiService.processMessageWithHistory(
                            roomId.toString(),
                            initialMessages,
                        );
                    } else {
                        result = await this.aiService.processMessageWithHistory(
                            roomId.toString(),);

                    }

                    console.log("Result", JSON.stringify(result, (_key, value) => typeof value === 'bigint' ? value.toString() : value))
                    const waitTool = result.toolResults?.find(tr => tr.tool.startsWith('waitFor'));
                    if (waitTool && waitTool.params) {
                        const seconds = parseInt(waitTool.params);
                        console.log(`Waiting for ${seconds} seconds...`);
                        await new Promise(resolve => setTimeout(resolve, seconds * 1000));
                    }
                    requests++;

                }
                console.log(`Contract Listener Service: Max requests reached for Room ${roomId}. Stopping...`);
                this.aiService.markRoomAsStopped(roomId.toString());

            })

            this.isRunning = true;
            console.log("Contract listener service started successfully");
        } catch (error) {
            console.error("Failed to start contract listener service:", error);
            throw error;
        }
    }

    public async stop(): Promise<void> {
        if (!this.isRunning) return;

        try {
            // Remove all event listeners
            this.roomContract.removeAllListeners();
            this.isRunning = false;
            console.log("Contract listener service stopped successfully");
        } catch (error) {
            console.error("Failed to stop contract listener service:", error);
            throw error;
        }
    }
}