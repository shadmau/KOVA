import axios from "axios";
import { BaseService } from "./base.service.js";
import { GetParticipantsAction } from "../plugins/actions/get-participants.action.js";
import { Memory } from "@ai16z/eliza";
import { getVolume } from "./const.js";
import { SwapService } from "./swap.service.js";
import { parseEther } from "viem";
import { AgentType, Message, Participant, RoomActionData, Tool, TransactionAction, TransactionStatus, TransactionType, VolumePeriod } from "../types.js";

const AI_URI = process.env.AI_URI;
if (!AI_URI) {
  throw new Error("AI_URI is not set");
}

export class AIAgentService extends BaseService {
  private static instance: AIAgentService;
  private tools: Map<string, Tool>;
  private isRunning: boolean = false;
  private messageHistory: Map<string, Message[]> = new Map();
  private roomActionData: Map<string, RoomActionData> = new Map();

  private participantsAction: GetParticipantsAction;
  private swapService: SwapService;

  private constructor() {
    super();

    this.tools = new Map();
    this.participantsAction = new GetParticipantsAction();

    // Register tools
    this.registerTool({
      name: "getParticipants",
      description: "Retrieves the list of participants in the room",
      handler: this.getParticipants.bind(this)
    });

    this.registerTool({
      name: "noAction",
      description: "No Action",
      handler: this.noAction.bind(this)
    });

    this.registerTool({
      name: "executeTrade",
      description: "Execute a trade",
      handler: this.executeTrade.bind(this)
    });

    this.registerTool({
      name: "getTopVolumeCoins",
      description: "Get the top volume coin",
      handler: this.getTopVolumeCoins.bind(this)
    });

    this.registerTool({
      name: "waitFor",
      description: "Wait for specified seconds",
      handler: this.waitFor.bind(this)
    });

    this.registerTool({
      name: "stop",
      description: "Stop the Room",
      handler: this.stopRoom.bind(this)
    });

    this.swapService = SwapService.getInstance();

  }

  public static getInstance(): AIAgentService {
    if (!AIAgentService.instance) {
      console.log("AIAgentService instance not found, creating new instance");
      AIAgentService.instance = new AIAgentService();
    }
    return AIAgentService.instance;
  }

  public async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    try {
      this.isRunning = true;
      console.log('AIAgentService started successfully');
    } catch (error) {
      console.error('Failed to start AIAgentService:', error);
      throw error;
    }
  }

  public async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      // Cleanup runtime and connections
      this.isRunning = false;
      console.log('AIAgentService stopped successfully');
    } catch (error) {
      console.error('Failed to stop AIAgentService:', error);
      throw error;
    }
  }

  public registerTool(tool: Tool) {
    this.tools.set(tool.name, tool);
  }

  private extractToolCalls(response: string): string[] {
    const toolRegex = /<tool>(.*?)<\/tool>/g;
    const matches = [...response.matchAll(toolRegex)];
    return matches.map((match) => match[1]);
  }

  private async handleToolCalls(toolCalls: string[], roomId: string): Promise<any[]> {
    if (!this.isRunning) {
      throw new Error('AIAgentService must be started before processing messages');
    }

    const results = [];

    for (const toolCall of toolCalls) {
      let toolName = toolCall;
      let params = null;
      const functionMatch = toolCall.match(/^(\w+)(?:\((.*)\))?$/);
      if (functionMatch) {
        toolName = functionMatch[1];
        params = functionMatch[2]?.trim() || null;
      }

      // Handle specific parameter processing for each tool
      if (toolName.toLowerCase() === 'executeTrade'.toLowerCase()) {
        const tradeParams = params ? params.split(',').map(p => p.trim()) : [];
        params = [roomId, ...tradeParams];
      } else if (toolName.toLowerCase() === 'getTopVolumeCoins'.toLowerCase()) {
        params = params || '1d'; // default to '1d' if no parameter provided
      } else if (toolName.toLowerCase() === 'getparticipants'.toLowerCase()) {
        params = roomId;
      } else if (toolName.toLowerCase() === 'stop'.toLowerCase()) {
        params = roomId;
      }

      console.log(`Calling tool: ${toolName} with params: ${params}`);

      const tool = this.tools.get(toolName);
      if (tool) {
        try {
          const result = await tool.handler(params);
          await new Promise(resolve => setTimeout(resolve, 1500));
          results.push({
            tool: toolCall,
            params: params,
            result
          });
        } catch (error) {
          console.error(`Error executing tool ${toolCall}:`, error);
          results.push({
            tool: toolCall,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      } else {
        results.push({
          tool: toolCall,
          error: `Unknown tool: ${toolCall}`
        });
      }
    }

    return results;
  }

  public async processMessageWithHistory(roomId: string, initialMessages?: Message[]) {
    if (!this.isRunning) {
      throw new Error('AIAgentService must be started before processing messages');
    }
    if (this.roomActionData.get(roomId)?.isStopped) {
      return {
        response: "Room is stopped",
        messages: [],
        toolResults: null
      };
    }

    let messages = this.messageHistory.get(roomId) || [];
    if (initialMessages && messages.length === 0) {
      messages = [...initialMessages];
    }

    try {
      this.incrementComputation(roomId);
      console.log(`===============================================
All Actions of Room ${roomId}: ${JSON.stringify(this.getRoomActionData(roomId), (_key, value) => typeof value === 'bigint' ? value.toString() : value)}
===============================================
All Room Action Data: ${JSON.stringify(this.roomActionData, (_key, value) => typeof value === 'bigint' ? value.toString() : value)}
===============================================`);
      // Send request to local AI service
      const response = await axios.post(AI_URI!, {
        messages
      }, {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });

      const aiResponse = response.data.choices[0].message.content;
      messages.push({
        role: "assistant",
        content: aiResponse
      });
      // Check for tool calls
      const toolCalls = this.extractToolCalls(aiResponse);
      if (toolCalls.length > 0) {
        console.log("toolCalls", toolCalls);
        const toolResults = await this.handleToolCalls(toolCalls, roomId);
        messages.push({
          role: "user",
          content: `Tool results: ${JSON.stringify(toolResults)}`
        });

        this.messageHistory.set(roomId, messages);

        return {
          response: aiResponse,
          toolResults,
          messages
        };
      } else {
        console.log("no tool calls");
      }

      this.messageHistory.set(roomId, messages);

      return {
        response: aiResponse,
        messages,
        toolResults: null
      };

    } catch (error) {
      console.error("Error processing message:", error);
      throw error;
    }
  }

  private async getParticipants(roomId: string): Promise<any> {
    const msg: Memory = {
      id: "1-1-1-1-1",
      agentId: "0-0-0-0-0",
      userId: "0-0-0-0-0",
      roomId: "0-0-0-0-0", //todo: 0-0-0-0-[correct room id]
      content: {
        text: "get_participants",
        roomID: roomId
      },
      createdAt: Date.now()
    };
    console.log("Retrieving participants")
    const participantsDemo = await this.participantsAction.handler({} as any, msg) as Participant[];
    if (participantsDemo.length !== 2) {
      console.log(`Could not retrieve participants`)
      return {
        participants: []
      }
    }
    const formattedParticipants = participantsDemo.map(p => ({
      ...p,
      type: AgentType[p.type] // Converting 0 to "Trader", 1 to "Investor"
    }));
    console.log(`Participants retrieved: ${JSON.stringify(formattedParticipants)}`)

    return formattedParticipants;
  }

  private async noAction(roomId?: string): Promise<any> {
    return {
      action: "Taking no Trading action"
    };
  }


  private async getTopVolumeCoins(period: string = '1d'): Promise<any> {
    if (!['1d', '7d', '30d'].includes(period)) {
      period = '1d';
    }
    console.log("Retrieving volumes")

    const volumes = getVolume(period as VolumePeriod);
    let sortedTickers = []
    for (const volume of volumes.pools) {
      sortedTickers.push({ ticker: volume.ticker, volume: volume.volume })
    }
    console.log("Formatted volumes", sortedTickers)
    return {
      pools: sortedTickers,
      period: period
    };
  }

  private async stopRoom(roomId: string): Promise<any> {
    this.markRoomAsStopped(roomId);
    return {
      action: "Room stopped"
    };
  }

  private async executeTrade(params?: any[]): Promise<{ sucess: boolean, action: string }> {
    const [roomId, ticker, amount] = params || [];
    try {
      const pool = SwapService.getPoolByTicker(ticker);
      console.log("swap service", this.swapService)
      const swapTx = await SwapService.getInstance().swap(parseInt(roomId), pool.poolAddress, parseEther(amount));
      this.addOrUpdateTransactionAction(roomId, {
        txHash: swapTx,
        status: TransactionStatus.CONFIRMED,
        volumeUSD: parseEther(amount),
        type: TransactionType.SWAP
      });

      return {
        sucess: true,
        action: `Successfully executed trade: ${ticker} for ${amount} ${swapTx}`
      };
    } catch (error) {
      console.error("Error executing trade:", error);
      return {
        sucess: false,
        action: `Failed to execute trade: ${error}`
      };
    }
  }

  private async waitFor(seconds: string): Promise<any> {
    return {
      action: `Waiting for ${seconds} seconds`
    };
  }



  public getMessageHistory(roomId: string): Message[] {
    return this.messageHistory.get(roomId) || [];
  }

  public clearMessageHistory(roomId?: string): void {
    if (roomId) {
      this.messageHistory.delete(roomId);
    } else {
      this.messageHistory.clear();
    }
  }

  public addOrUpdateTransactionAction(
    roomId: string,
    action: Omit<TransactionAction, "timestamp">
  ): void {
    let data = this.roomActionData.get(roomId);
    if (!data) {
      data = { transactions: [], computationCount: 0, isStopped: false };
    }
    let existingTx = null;
    if (action.txHash) {
      const txHashLower = action.txHash.toLowerCase();
      existingTx = data.transactions.find(tx => tx.txHash?.toLowerCase() === txHashLower);
    }
    if (existingTx) {
      existingTx.status = action.status;
      existingTx.volumeUSD = action.volumeUSD;
      existingTx.timestamp = Date.now();
    } else {
      data.transactions.push({ ...action, timestamp: Date.now() });
    }
    this.roomActionData.set(roomId, data);
  }


  public incrementComputation(roomId: string, count: number = 1): void {
    let data = this.roomActionData.get(roomId);
    if (!data) {
      data = { transactions: [], computationCount: 0, isStopped: false };
    }
    data.computationCount += count;
    this.roomActionData.set(roomId, data);
  }


  public markRoomAsStopped(roomId: string): void {
    let data = this.roomActionData.get(roomId);
    if (!data) {
      data = { transactions: [], computationCount: 0, isStopped: false };
    }
    data.isStopped = true;
    this.roomActionData.set(roomId, data);
  }


  public getRoomActionData(roomId: string): RoomActionData | undefined {
    return this.roomActionData.get(roomId);
  }

}