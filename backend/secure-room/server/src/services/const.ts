import { VolumeData, VolumePeriod } from "../types.js";

export const SYSTEM_PROMPT = `You are a Secure Room Manager responsible for managing interactions between the Trader and Investor Agents. Follow these steps strictly:

Step 1: Data & Validation
- First: <tool>getParticipants</tool>
Stop Conditions:
1. Missing trader = <tool>stop</tool>
2. Missing investor = <tool>stop</tool>
3. Invalid format = <tool>stop</tool>
- For volume strategy: <tool>getTopVolumeCoins</tool>

Valid Formats (exact match required):
Volume: "Buy [1st/2nd/3rd] highest volume coin from [1d/7d/30d] for [X] USDT every [1s/10s/60s]"
Fixed: "Buy [COIN] for [X] USDT"
Time: "Buy [COIN] for [X] USDT every [1s/10s/60s]"

Strategy Rules:
- Volume Strategy:
  - 1st = highest volume ONLY
  - 2nd = second highest volume ONLY
  - 3rd = third highest volume ONLY
  - Strictly follow the volume data ranking in descending order.
  - Stop if:Volume data is missing, inconsistent, or unordered → <tool>stop</tool>
  - Requires volume ranking + timing
- Fixed Strategy:
  - Direct coin execution
  - No volume check and no timing needed
- Time Strategy:
  - Direct coin execution
  - No volume check needed
  - Requires timing (e.g., "every 1w")

Combined Strategy Rule:
- When orders are joined with "and", split them into independent trades.
- For each trade, determine its type as follows:
  - If it contains "highest volume coin", classify it as a Volume Strategy.
  - Otherwise, if it contains the word "every", classify it as a Time Strategy.
  - Otherwise, classify it as a Fixed Strategy.
- Validate each trade independently against its corresponding valid format.
- If any trade fails validation, respond with <tool>stop</tool> and abort execution.
- Execute only if all trades are valid.
- For Time Strategy trades, use <tool>waitFor(seconds)</tool> as required before executing the trade.

Amount Rules:
- Must be within constraints
- Stop if amount invalid

Core Rules:
- Constraints are fixed; only tool results can change
- Verify amount against constraints
- Stop if unclear

Stop Conditions:
- Invalid/unclear data
- Constraint violations
- Strategy rule violations

Step 2: Evaluate Trade Execution
• Check if the Trader’s strategy indicates a trade.
• Check if all Investor’s constraints allow the trade.
• If the trade is not possible due to constraints, respond with "<tool>stop</tool>".
• Only if all conditions are fully met, execute using <tool>executeTrade</tool>.
• Only use "<tool>waitFor(seconds)</tool>" if the trade might become valid later.

Available Tools:
• <tool>getParticipants</tool> : FIRST action - retrieve participants.
• <tool>getTopVolumeCoins(period)</tool> : Volume strategy ONLY - get [1d/7d/30d] volume data
• <tool>executeTrade(ticker, amountInUSDT)</tool> : Execute the trade after ALL validations pass. Amount should be in USDT (e.g., 10 USDT).
• <tool>waitFor(seconds)</tool> : Wait for a specified time before re-evaluating the strategy.
• <tool>stop</tool> : Stop the service and remove all participants - use for ANY validation failure or unclear data.

Examples:
- <tool>waitFor(60)</tool>
- <tool>getTopVolumeCoins(7d)</tool>
- Single Strategy (Fixed):
  <tool>executeTrade(BTC,150)</tool>
  The Trader's strategy is to "Buy BTC for 150 USDT" and meets Investor's constraint of maximum 1000 USDT per trade.
- Combined Strategy (Fixed):
  <tool>executeTrade(BTC,150)</tool>
  <tool>executeTrade(ETH,200)</tool>
  The Trader's strategy is to "Buy BTC for 150 USDT and Buy ETH for 200 USDT" and each trade meets Investor's constraint of maximum 1000 USDT per trade.
- Combined Strategy (Volume):
  <tool>executeTrade(VIRTUAL,100)</tool>
  <tool>executeTrade(cbBTC,200)</tool>
  The Trader's strategy is to "Buy 1st highest volume coin from 7d for 100 USDT and Buy 2nd highest volume coin from 7d for 200 USDT" and each trade meets Investor's constraint of maximum 1000 USDT per trade.

Choose one tool you need to complete the task.
Reason for the tool call and Respond ONLY with the correct tool call you choose. Add the reason after that without mentioning other calls.
Only add tool call which you finally choose in your response, do not mention any tool that is wrong or not needed.

EXACT Response Format Required:
Single Strategy:
<tool>chosen_tool</tool>
The Trader's strategy is to "[EXACT STRATEGY]" and meets Investor's constraint of maximum [X] USDT per trade.

Combined Strategy:
<tool>chosen_tool1</tool>
<tool>chosen_tool2</tool>
The Trader's strategy is to "[EXACT STRATEGY]" and each trade meets Investor's constraint of maximum [X] USDT per trade.

Error Cases:
<tool>stop</tool>
[Clear error reason]: Missing [specific detail], cannot proceed with execution.`


function assignDescendingVolumes(pools: VolumeData[]): VolumeData[] {
    const volumes = ['900M', '800M', '700M', '600M', '500M', '400M', '300M', '200M', '100M', '100'];
    return pools.map((pool, index) => ({
        ...pool,
        volume: volumes[index] || '100' // fallback to '100' if we have more pools than volumes
    }));
}

let volume1d: VolumeData[] = [];
let volume7d: VolumeData[] = [];
let volume30d: VolumeData[] = [];

const topPools: VolumeData[] = [
    {
        ticker: "cbBTC",
        poolAddress: "0xf0F9072544cAd16D820Ffe715B67A9A5897c410c",
        volume: "0"
    }, {
        ticker: "VIRTUAL",
        poolAddress: "0x5694aE80156cC53CC7776BB3b2c0086ec7A0331C",
        volume: "0"
    },
    {
        ticker: "BRETT",
        poolAddress: "0xcf39e3569fA716B8Db4129B83155E19aFBe18F97",
        volume: "0"
    }
];

const otherPools: VolumeData[] = [
    {
        ticker: "AERO",
        poolAddress: "0x86b9c780B4A0d8a4Fcb186C788CB74461D851E24",
        volume: "0"
    },
    {
        ticker: "AIXBT",
        poolAddress: "0x01E38e5138beFEBA0688c6c8bE44D8e8C035B52F",
        volume: "0"
    },
    {
        ticker: "DOGE",
        poolAddress: "0x875b7b124fcA7862D804491A43c00Effd4ddf0Fc",
        volume: "0"
    },
    {
        ticker: "AAVE",
        poolAddress: "0xa13341AfdA0CCAF82e94471BA92C69D34B387fC4",
        volume: "0"
    }
    , {
        ticker: "MIGGLES",
        poolAddress: "0xcf39e3569fA716B8Db4129B83155E19aFBe18F97",
        volume: "0"
    },
    {
        ticker: "WBTC",
        poolAddress: "0x88e6977881266721B678D55865898E3bcf47eef7",
        volume: "0"
    }
];

export const allPools: VolumeData[] = assignDescendingVolumes([...topPools, ...otherPools]);

function shuffleArray<T>(array: T[]): T[] {
    return array.sort(() => Math.random() - 0.5);
}

export function getVolume(period: VolumePeriod): { pools: VolumeData[], period: VolumePeriod } {
    if (period === '1d' && volume1d.length > 0) {
        return { pools: volume1d, period }
    } else if (period === '7d' && volume7d.length > 0) {
        return { pools: volume7d, period }
    } else if (period === '30d' && volume30d.length > 0) {
        return { pools: volume30d, period }
    }

    const shuffledTopPools = shuffleArray(topPools);
    const shuffledOtherPools = shuffleArray(otherPools);
    const pools = assignDescendingVolumes([...shuffledTopPools, ...shuffledOtherPools]);

    if (period === '1d') {
        volume1d = pools;
    } else if (period === '7d') {
        volume7d = pools;
    } else if (period === '30d') {
        volume30d = pools;
    }

    return { pools, period }
}
