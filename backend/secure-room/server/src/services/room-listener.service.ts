import { BaseService } from "./base.service.js";
import { ethers } from "ethers";
import { AIAgentService, Message } from "./agent.service.js";

const IROOM = [
    "function getParticipants(uint256 roomId) external view returns (uint256[] memory tokenIds)",
]

export class ContractListenerService extends BaseService {
    private static instance: ContractListenerService;
    private provider: ethers.JsonRpcProvider;
    private contract: ethers.Contract;
    private aiService: AIAgentService;
    private isRunning: boolean = false;

    private constructor() {
        super();
        this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        this.contract = new ethers.Contract(
            process.env.AGENT_CONTRACT_ADDRESS!,
            IROOM,
            this.provider
        );
        this.aiService = AIAgentService.getInstance();
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
            //!dummy messages
            const messages: Message[] = [
                {
                    role: "system",
                    content: "You are a Secure Room manager. Your task is to manage interactions between the Trader and Investor Agents. Available tools: - <tool>getParticipants</tool>: Retrieve the list of participants in the room. - <tool>getNFTData</tool>: Retrieve NFT data for the Trader and Investor Agents. Use these tools to gather the necessary information and proceed with the simulation."
                },
                {
                    role: "user",
                    content: "start"
                }
            ];

            // Listen for RoomCreated events
            this.contract.on("RoomCreated", async (roomId: bigint, creator: string) => {
                console.log(`New room created! Room ID: ${roomId}, Creator: ${creator}`);
                //todo: create message to process..
                await this.aiService.processMessage(
                    messages,
                    roomId.toString()
                );
            });    

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
            this.contract.removeAllListeners();
            this.isRunning = false;
            console.log("Contract listener service stopped successfully");
        } catch (error) {
            console.error("Failed to stop contract listener service:", error);
            throw error;
        }
    }
}