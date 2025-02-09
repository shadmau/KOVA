import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import testRouter from "./routes/test.js";
import secureRoomRoute from "./routes/secure-room.js";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { IService } from "./services/base.service.js";
import cookieParser from "cookie-parser";
import { AnyType } from "./utils.js";
import { isHttpError } from "http-errors";
import { AIAgentService } from "./services/agent.service.js";
import { ContractListenerService } from "./services/room-listener.service.js";
import { WalletService } from "./services/wallet.service.js";
import { SwapService } from "./services/swap.service.js";
import { NilionService } from "./services/nilion.service.js";
import nilionRoute from "./routes/nilion.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const services: IService[] = [
  WalletService.getInstance(),
  SwapService.getInstance(),
  AIAgentService.getInstance(),
  ContractListenerService.getInstance(),
  NilionService.getInstance(),
];

dotenv.config({
  path: resolve(__dirname, "../.env"),
});

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());
app.use(cookieParser());

app.use("/api/secure-room", secureRoomRoute);
app.use("/api/test", testRouter);
app.use("/api/nillion", nilionRoute);

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

app.listen(port, async () => {
  try {
    console.log(`Server running on PORT: ${port}`);
    console.log("Server Environment:", process.env.NODE_ENV);

    for (const service of services) {
      console.log(`Starting ${service.constructor.name}...`);
      await service.start();
    }
    console.log("All services started successfully");

  } catch (e) {
    console.error("Failed to start server:", e);
    process.exit(1);
  }
});

async function gracefulShutdown() {
  console.log("Shutting down gracefully...");
  await Promise.all(services.map((service) => service.stop()));
  process.exit(0);
}

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
