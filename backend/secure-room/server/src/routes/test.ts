import { Router, Request, Response, NextFunction } from "express";

const router = Router();
const TRADER_STRATEGIES = [
  "Buy 1st highest volume coin from 1d for 10 USDT every 1s",
  "Buy 2nd highest volume coin from 7d for 50 USDT every 10s",
  "Buy 1st highest volume coin from 7d for 4 USDT every 1s and Buy 2nd highest volume coin from 7d for 50 USDT every 10s",
  
];


const INVESTOR_CONSTRAINTS = [
  "maximum investment per trade: 50 USDT",
];


const checkNodeEnv = (_req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV !== "development") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
};

const handleTraderPrompt = async (_req: Request, res: Response) => {
  const id = parseInt(_req.params.id);
  if (isNaN(id) || id < 1 || id > TRADER_STRATEGIES.length) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  res.json({
    strategy: TRADER_STRATEGIES[id - 1]
  });
};

const handleInvestorPrompt = async (_req: Request, res: Response) => {
  const id = parseInt(_req.params.id);
  if (isNaN(id) || id < 1 || id > INVESTOR_CONSTRAINTS.length) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  res.json({
    constraints: INVESTOR_CONSTRAINTS[id - 1]
  });
};


router.get("/trader-prompt/:id", checkNodeEnv, handleTraderPrompt);
router.get("/investor-prompt/:id", checkNodeEnv, handleInvestorPrompt);
export default router;
