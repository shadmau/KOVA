import axios from 'axios';

export interface PromptData {
    strategy?: string;
    tradingStrategy?: string;
    constraints?: string;
}

const requiredEnvVars = [
    "IPFS_GATEWAY_URL",
  ];
  
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      throw new Error(`${varName} is not set`);
    }
  });
  const IPFS_GATEWAY_URL = process.env.IPFS_GATEWAY_URL;

export class PromptFetcher {
    static async fetchPromptFromURI(uri: string): Promise<PromptData> {
        try {
            console.log('Fetching prompt from URI:', uri);
            const url = uri.toLowerCase().startsWith('ipfs://')
                ? `${IPFS_GATEWAY_URL}/ipfs/${uri.replace(/^ipfs:\/\//i, '')}`
                : uri;

            const response = await axios.get(url);
            return response.data as PromptData;

        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Failed to fetch prompt: ${error.response?.statusText || error.message}`);
            }
            throw new Error(`Error fetching prompt: ${error.message}`);
        }
    }
}