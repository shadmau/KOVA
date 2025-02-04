import { ActionExample, Handler, Validator } from "@ai16z/eliza";
import { CollabLandBaseAction } from "./collabland.action.js";
import { ethers } from "ethers";
export interface Participant {
    name: string;
    description: string;
    model: string;
    userPromptURI: string;
    systemPromptURI: string;
    promptsEncrypted: boolean;
}

if (!process.env.SECURE_ROOM_CONTRACT_ADDRESS) {
    throw new Error("SECURE_ROOM_CONTRACT_ADDRESS is not set");
}
if (!process.env.RPC_URL) {
    throw new Error("RPC_URL is not set");
}
if (!process.env.AGENT_CONTRACT_ADDRESS) {
    throw new Error("AGENT_CONTRACT_ADDRESS is not set");
}

const IERC7662 = [
    "function getAgentData(uint256 tokenId) external view returns (string memory name, string memory description, string memory model, string memory userPromptURI, string memory systemPromptURI, bool promptsEncrypted)",
];

const IROOM = [
    "function getParticipants(uint256 roomId) external view returns (uint256[] memory tokenIds)",
]
//todo: Test
export class GetParticipantsAction extends CollabLandBaseAction {
    constructor() {
        const name = "Retrieve Participants";
        const description = "An action to retrieve the participants in the room";
        const similes = ["TEST", "HELLO"];

        const handler: Handler = async (runtime, message): Promise<Participant[]> => {
            if (runtime.agentId !== "1-1-1-1-1") {
                throw new Error("This action is only available to the secure room");
            }
            const roomID = message.content.roomID as number


            const agentContractAddress = process.env.AGENT_CONTRACT_ADDRESS;
            const roomContractAddress = process.env.SECURE_ROOM_CONTRACT_ADDRESS;
            const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

            const agentContract = new ethers.Contract(agentContractAddress!, IERC7662, provider);
            const roomContract = new ethers.Contract(roomContractAddress!, IROOM, provider);

            const tokenIDs = await roomContract.getParticipants(roomID);
            let participants: Participant[] = [];

            for (const tokenID of tokenIDs) {
                const tokenId = parseInt(tokenID);
                const participant = await agentContract.getAgentData(tokenId);
                participants.push(participant);
            }
       

            //todo: decrypt the prompts..

            return participants;
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