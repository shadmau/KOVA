import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import helloRouter from "./routes/hello.js";
import secureRoomRoute from "./routes/secure-room.js";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
// import { NgrokService } from "./services/ngrok.service.js";
//import { TelegramService } from "./services/telegram.service.js";
import { IService } from "./services/base.service.js";
//import twitterRouter from "./routes/twitter.js";
//import discordRouter from "./routes/discord.js";
import cookieParser from "cookie-parser";
//import githubRouter from "./routes/github.js";
import { AnyType } from "./utils.js";
import { isHttpError } from "http-errors";
import { AIAgentService, Message } from "./services/agent.service.js";
import { Memory } from "@ai16z/eliza";
import { GetParticipantsAction } from "./plugins/actions/get-participants.action.js";
import { ContractListenerService } from "./services/room-listener.service.js";

// Convert ESM module URL to filesystem path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Track services for graceful shutdown
const services: IService[] = [
  AIAgentService.getInstance(),
  ContractListenerService.getInstance(),
];

// Load environment variables from root .env file
dotenv.config({
  path: resolve(__dirname, "../.env"),
});

// Initialize Express app
const app = express();
const port = process.env.PORT || 3001;

// Configure CORS with ALL allowed origins
app.use(cors());

// Parse JSON request bodies
app.use(express.json());
app.use(cookieParser());

// Mount hello world test route
app.use("/hello", helloRouter);

app.use("/api/secure-room", secureRoomRoute);

async function testTestAction() {
  const testAction = new GetParticipantsAction();
  const dummyRuntime = {} as any;
  const dummyMessage: Memory = {
    id: "1-1-1-1-1",
    agentId: "1-2-3-4-5",
    userId: "1-2-3-4-5",
    roomId: "1-2-3-4-5",
    content: {
      text: "test"
    },
    createdAt: Date.now()
  };

  const result = await testAction.handler(dummyRuntime, dummyMessage);
  console.log("Action result:", result);
}

async function testAIAgent() {
  const aiService = AIAgentService.getInstance();
  await aiService.start();
  
  const messages:Message[] = [
    {
      role: "system",
      content: "You are a Secure Room manager.   Your task is to manage interactions between the Trader and Investor Agents. Available tools: - <tool>getParticipants</tool>: Retrieve the list of participants in the room. - <tool>getNFTData</tool>: Retrieve NFT data for the Trader and Investor Agents. Use these tools to gather the necessary information and proceed with the simulation."
    },
    {
      role: "user",
      content: "start"
    }
  ];

  try {
    console.log("Sending messages to AI Agent");
    const result = await aiService.processMessage(messages, "test-room");
    console.log("\n=== AI Agent Test Results ===");
    console.log("Response:", result.response);
    if (result.toolResults) {
      console.log("Tool Results:", JSON.stringify(result.toolResults, null, 2));
    }
    console.log("===========================\n");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

//testTestAction()
testAIAgent()




// Call the function to test it

// Initialize Telegram bot service
//const telegramService = TelegramService.getInstance();

// Mount Telegram webhook endpoint
//app.use("/telegram/webhook", telegramService.getWebhookCallback());

// Mount Twitter OAuth routes
//app.use("/auth/twitter", twitterRouter);

// Mount Discord OAuth routes
//app.use("/auth/discord", discordRouter);

// Mount GitHub OAuth routes
//app.use("/auth/github", githubRouter);

// 404 handler
app.use((_req: Request, _res: Response, _next: NextFunction) => {
  _res.status(404).json({
    message: `Route ${_req.method} ${_req.url} not found`,
  });
});

app.use((_err: AnyType, _req: Request, _res: Response, _next: NextFunction) => {
  if (isHttpError(_err)) {
    _res.status(_err.statusCode).json({
      message: _err.message,
    });
  } else if (_err instanceof Error) {
    _res.status(500).json({
      message: `Internal Server Error: ${_err.message}`,
    });
  } else {
    _res.status(500).json({
      message: `Internal Server Error`,
    });
  }
});

// Start server and initialize services
app.listen(port, async () => {
  try {
    console.log(`Server running on PORT: ${port}`);
    console.log("Server Environment:", process.env.NODE_ENV);
    // await Promise.all(services.map(service => service.start()));

    // Start ngrok tunnel for development
    // const ngrokService = NgrokService.getInstance();
    // await ngrokService.start();
    // services.push(ngrokService);

    // const ngrokUrl = ngrokService.getUrl()!;
    // console.log("NGROK URL:", ngrokUrl);

    // Initialize Telegram bot and set webhook
    // await telegramService.start();
    // await telegramService.setWebhook(ngrokUrl);
    // services.push(telegramService);

    // const botInfo = await telegramService.getBotInfo();
    // console.log("Telegram Bot URL:", `https://t.me/${botInfo.username}`);
  } catch (e) {
    console.error("Failed to start server:", e);
    process.exit(1);
  }
});

// Graceful shutdown handler
async function gracefulShutdown() {
  console.log("Shutting down gracefully...");
  await Promise.all(services.map((service) => service.stop()));
  process.exit(0);
}

// Register shutdown handlers
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
