import { ActionExample, Handler, Validator } from "@ai16z/eliza";
import { CollabLandBaseAction } from "./collabland.action.js";
import { ethers } from "ethers";
import { PromptFetcher } from "../../services/utils/agent-prompt-fetcher.js";
import { AgentType, Participant } from "../../types.js";
import { IROOM_ABI } from "../../contracts/abis/IROOM.js";
import { IERC7662_EXTENDED_ABI } from "../../contracts/abis/IERC7662_Extended.js";

const requiredEnvVars = [
    "SECURE_ROOM_CONTRACT_ADDRESS",
    "RPC_URL",
    "AGENT_CONTRACT_ADDRESS",
  ];
  
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      throw new Error(`${varName} is not set`);
    }
  });

const SECURE_ROOM_CONTRACT_ADDRESS = process.env.SECURE_ROOM_CONTRACT_ADDRESS;
const RPC_URL = process.env.RPC_URL;
const AGENT_CONTRACT_ADDRESS = process.env.AGENT_CONTRACT_ADDRESS;


export class GetParticipantsAction extends CollabLandBaseAction {

    constructor() {
        const name = "Retrieve Participants";
        const description = "An action to retrieve the participants in the room";
        const similes = ["TEST", "HELLO"];

        const handler: Handler = async (runtime, message): Promise<Participant[]> => {
            if (message.agentId !== "0-0-0-0-0") {
                throw new Error("This action is only available for secure room messages");
            }
            try {
                const roomID = message.content.roomID as number
            
            const provider = new ethers.JsonRpcProvider(RPC_URL);
            const agentContract = new ethers.Contract(AGENT_CONTRACT_ADDRESS!, IERC7662_EXTENDED_ABI, provider);
            const roomContract = new ethers.Contract(SECURE_ROOM_CONTRACT_ADDRESS!, IROOM_ABI, provider);
            let participants: Participant[] = [];
            console.log(`Getting participants for room ${roomID}`);
            const tokenIDs = await roomContract.getAgentsInRoom(roomID);
            console.log(`Room ${roomID} has ${tokenIDs.length} participants: ${tokenIDs.join(", ")}`);
            for (const tokenID of tokenIDs) {
                const participant = await agentContract.getAgentData(tokenID);
                const prompt = await PromptFetcher.fetchPromptFromURI(participant.userPromptURI);
                const agentExtraData = await agentContract.getAgentExtraData(tokenID)
                const agentType = parseInt(agentExtraData[0])
             
                switch (agentType) {
                    case AgentType.Trader:
                        const strategy = prompt.strategy || prompt.tradingStrategy;
                        if (!strategy || strategy.length === 0) {
                            console.log("Error: Trader Agent needs a strategy. Neither 'strategy' nor 'tradingStrategy' found in prompt");
                        } else {
                            participants.push({ type: AgentType.Trader, strategy });
                        }
                        break;
                    case AgentType.Investor:
                        if (!prompt.constraints || prompt.constraints.length === 0) {
                            console.log("Investor Agent needs constraints");
                        } else {
                            participants.push({ type: AgentType.Investor, constraints: prompt.constraints });
                        }
                        break;
                    default:
                        console.log("Unknown agent type " + agentType);
                        break;
                }

            }

            return participants;

            } catch (error) {
                console.error("Error retrieving participants:", error);
                return [];
            }

        };

        const validate: Validator = async (): Promise<boolean> => {
            return true;
        };




        const examples: ActionExample[][] = [
            [
                {
                    user: "{{user1}}",
                    content: {
                        text: "Can you run the test action?",
                    },
                },
                {
                    user: "{{agentName}}",
                    content: {
                        text: "",
                        action: "TEST_ACTION",
                    },
                },
            ],
        ];

        super(name, description, similes, examples, handler, validate);
    }
}