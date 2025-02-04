import axios from "axios";
import { BaseService } from "./base.service.js";
interface Tool {
  name: string;
  handler: (params?: any) => Promise<any>;
  description: string;
}
export interface Message {
    role: "system" | "user" | "assistant";
    content: string;
  }
export class AIAgentService extends BaseService {
  private static instance: AIAgentService;
  private tools: Map<string, Tool>;
  private isRunning: boolean = false;

  private constructor() {
    super();
    this.tools = new Map();
    
    // Register default tools
    this.registerTool({
      name: "getParticipants",
      description: "Retrieves the list of participants in the room",
      handler: this.getParticipants
    });

    this.registerTool({
      name: "getNFTData",
      description: "Retrieves NFT data for the specified address",
      handler: this.getNFTData
    });
  }

  public static getInstance(): AIAgentService {
    if (!AIAgentService.instance) {
        console.log("AIAgentService instance not found, creating new instance");
      AIAgentService.instance = new AIAgentService();
    }
    return AIAgentService.instance;
  }

  // Implement BaseService methods
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

  private async handleToolCalls(toolCalls: string[]): Promise<any[]> {
    if (!this.isRunning) {
      throw new Error('AIAgentService must be started before processing messages');
    }

    const results = [];
    
    for (const toolCall of toolCalls) {
      const tool = this.tools.get(toolCall);
      if (tool) {
        try {
          const result = await tool.handler();
          results.push({
            tool: toolCall,
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

  public async processMessage(messages: Message[], roomId: string): Promise<any> {
    if (!this.isRunning) {
      throw new Error('AIAgentService must be started before processing messages');
    }

    try {
      // Send request to local AI service
      const response = await axios.post("http://localhost:8080/v1/chat/completions", {
        messages
      }, {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });

      const aiResponse = response.data.choices[0].message.content;

      // Check for tool calls
      const toolCalls = this.extractToolCalls(aiResponse);
      if (toolCalls.length > 0) {
        const toolResults = await this.handleToolCalls(toolCalls);
        return {          
          response: aiResponse,
          toolResults
        };
      }

      return {
        response: aiResponse
      };

    } catch (error) {
      console.error("Error processing message:", error);
      throw error;
    }
  }

  private async getParticipants(roomId?: number): Promise<string[]> {
    console.log("getParticipants", roomId);
    return ["participant1", "participant2"];
  }

  private async getNFTData(address?: string): Promise<any> {
    console.log("getNFTData", address);
    return { nfts: [] };
  }
}