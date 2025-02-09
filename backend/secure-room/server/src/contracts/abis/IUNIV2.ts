export const IUNIV2_ABI = [
    {
        type: "function",
        name: "swapExactTokensForTokens",
        stateMutability: "nonpayable",
        inputs: [
            { type: "uint256", name: "amountIn" },
            { type: "uint256", name: "amountOutMin" },
            { type: "address[]", name: "path" },
            { type: "address", name: "to" },
            { type: "uint256", name: "deadline" }
        ],
        outputs: [{ type: "uint256[]" }]
    },
    {
        type: "function",
        inputs: [
            { type: "uint256", name: "amountIn" },
            { type: "address[]", name: "path" }
        ],
        name: "getAmountsOut",
        outputs: [{ type: "uint256[]", name: "amounts" }],
        stateMutability: "view"
    }
];