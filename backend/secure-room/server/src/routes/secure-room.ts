import { Router, Request, Response, NextFunction } from "express";
import { AIAgentService } from "../services/agent.service.js";
import { WalletService } from "../services/wallet.service.js";
import { formatEther } from "viem";
import { TransactionStatus } from "../types.js";
const router = Router();
const walletService = WalletService.getInstance();

const checkNodeEnv = (_req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV !== "development") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
};

const aiService = AIAgentService.getInstance();
aiService.start();


// !remove 
let counter = 0
// Handler for opening secure room
const handleTest = async (req: Request, res: Response) => {
  try {
    counter++
    const roomId = counter.toString()
    // const aiService = AIAgentService.getInstance();
    const { initialMessages } = req.body;
    if (!initialMessages || !Array.isArray(initialMessages)) {
      res.status(400).json({
        success: false,
        error: "Initial messages are required and must be an array"
      });
      return
    }
    let result;

    for (let i = 0; i < 5; i++) {

      result = await aiService.processMessageWithHistory(
        roomId,
        initialMessages,
      );
      if (!result.toolResults || result.toolResults.length === 0) {
        break;
      }
      // console.log(result);
      const waitTool = result.toolResults?.find(tr => tr.tool.startsWith('waitFor'));
      if (waitTool && waitTool.params) {
        const seconds = parseInt(waitTool.params);
        console.log(`Waiting for ${seconds} seconds...`);
        await new Promise(resolve => setTimeout(resolve, seconds * 1000));
      }
      await new Promise(resolve => setTimeout(resolve, 250));

    }
    aiService.clearMessageHistory(roomId);
    res.status(200).json({
      message: result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
};


const handleGetRoomWallet = async (req: Request, res: Response) => {
  try {
    // Step 1: Check if the room id is provided
    const roomId = parseInt(req.params.roomId);
    if (!roomId) {
      res.status(400).json({
        success: false,
        error: "Room ID is required"
      });
      return;
    }

    // Step 2: Check if wallet for room exists
    const walletAddress: string | null = await walletService.getWalletAddress(parseInt(roomId.toString()));
    if (!walletAddress) {
      res.status(404).json({
        success: false,
        error: "Wallet not found"
      });
      return;
    }

    // Step 3: Return wallet address
    res.status(200).json({
      success: true,
      walletAddress,
      roomId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
};

const handleFaucetToken = async (req: Request, res: Response) => {
  try {
    const walletAddress = req.params.address;
    if (!walletAddress) {
      res.status(400).json({
        success: false,
        error: "Wallet address is required"
      });
      return;
    }

    const result = await walletService.faucetToken(walletAddress);

    if (result.success) {
      res.status(200).json({
        success: true,
        tx: result.tx
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error("Faucet error:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
};

const handleGetRoomActions = async (req: Request, res: Response) => {
  try {
    const singleRoomId = req.params.roomId;
    const queryRoomIds = req.query.roomIds as string;

    if (singleRoomId) {
      const roomData = AIAgentService.getInstance().getRoomActionData(singleRoomId);
      if (!roomData) {
        res.status(400).json({
          success: false,
          error: "Room actions not found"
        });
        return;
      }

      const totalVolume = roomData.transactions
        .filter(tx => tx.status === TransactionStatus.CONFIRMED)
        .reduce((sum, tx) => sum + BigInt(tx.volumeUSD), BigInt(0));
      const formattedTotalVolume = formatEther(totalVolume);

      const formattedTransactions = roomData.transactions.map(tx => ({
        ...tx,
        volumeUSD: formatEther(tx.volumeUSD)
      }));

      res.status(200).json({
        totalVolumeUSD: formattedTotalVolume,
        computationCount: roomData.computationCount,
        isStopped: roomData.isStopped,
        transactions: formattedTransactions
      });
      return;
    }

    if (queryRoomIds) {
      const roomIdArray = queryRoomIds.split(',').map(id => id.trim());
      const results: Record<string, any> = {};

      for (const roomId of roomIdArray) {
        const roomData = AIAgentService.getInstance().getRoomActionData(roomId);
        if (roomData) {
          const totalVolume = roomData.transactions
            .filter(tx => tx.status === TransactionStatus.CONFIRMED)
            .reduce((sum, tx) => sum + BigInt(tx.volumeUSD), BigInt(0));
          const formattedTotalVolume = formatEther(totalVolume);

          const formattedTransactions = roomData.transactions.map(tx => ({
            ...tx,
            volumeUSD: formatEther(tx.volumeUSD)
          }));

          results[roomId] = {
            totalVolumeUSD: formattedTotalVolume,
            computationCount: roomData.computationCount,
            isStopped: roomData.isStopped,
            transactions: formattedTransactions
          };
        }
      }

      res.status(200).json(results);
      return;
    }

    res.status(400).json({
      success: false,
      error: "Room ID(s) required"
    });
  } catch (error) {
    console.error("Error retrieving room actions:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
};


router.get("/wallet/:roomId", checkNodeEnv, handleGetRoomWallet);
router.get("/faucet/:address", handleFaucetToken);
router.get("/actions/:roomId", handleGetRoomActions);
router.get("/actions", handleGetRoomActions);
// router.post("/test", handleTest);


export default router;
