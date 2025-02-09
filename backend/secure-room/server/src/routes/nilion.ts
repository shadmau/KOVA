import { Router, Request, Response, NextFunction } from "express";
import { NilionService, SchemaType } from "../services/nilion.service.js";


const router = Router();
const nillionService = NilionService.getInstance();
const checkNodeEnv = (_req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV !== "development") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
};


const handleEncryption = async (req: Request, res: Response) => {
  try {
    const { data, type } = req.body;

    if (!data || !type) {
        res.status(400).json({
        success: false,
        error: "Data and type are required"
      });
      return;
    }

    if (!Object.values(SchemaType).includes(type)) {
      res.status(400).json({
        success: false,
        error: "Invalid schema type"
      });
      return;
    }
    console.log(data);
    const nillionUri = await nillionService.encryptData(data[0], type as SchemaType);

    res.status(200).json({
      success: true,
      nillionUri
    });
  } catch (error) {
    console.error("Error encrypting data:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
};

const handleDecryption = async (req: Request, res: Response) => {
  try {
    const { nillionUri } = req.query;

    if (!nillionUri) {
      res.status(400).json({
        success: false,
        error: "Nillion URI is required"
      });
      return;
    }

    const decryptedData = await nillionService.decryptData(nillionUri as string);

    res.status(200).json({
      success: true,
      data: decryptedData
    });
  } catch (error) {
    console.error("Error decrypting data:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
};

router.post("/encrypt", checkNodeEnv, handleEncryption);
router.get("/decrypt", handleDecryption);

export default router;



/*


curl -X GET "http://localhost:3006/api/nillion/encrypt" \
-H "Content-Type: application/json" \
-d '{
  "type": "trader",
  "data": [{
    "agentRole": "Trader",
    "tradingGoals": "long-term",
    "timestamp": 1739083926289,
    "tradingStrategy": { "$allot": "Buy 12 USDT worth of DOGE" }
  }]
}'


*/