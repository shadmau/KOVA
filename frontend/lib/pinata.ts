// lib/pinata.ts
import { PinataSDK } from "pinata-web3";

export class PinataService {
  private static pinata: PinataSDK;

  private static initialize() {
    if (!this.pinata) {
      const pinataJwt = process.env.NEXT_PUBLIC_PINATA_JWT;
      const pinataGateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY;

      if (!pinataJwt || !pinataGateway) {
        throw new Error(
          "Pinata credentials not found in environment variables"
        );
      }

      this.pinata = new PinataSDK({
        pinataJwt,
        pinataGateway,
      });
    }
  }

  static async uploadJSON(data: any): Promise<string> {
    try {
      this.initialize();

      // Convert JSON to Blob/File
      const jsonString = JSON.stringify(data);
      const file = new File([jsonString], `agent-data-${Date.now()}.json`, {
        type: "application/json",
      });

      const result = await this.pinata.upload.file(file);
      return result.IpfsHash;
    } catch (error) {
      console.error("Error uploading to Pinata:", error);
      throw error;
    }
  }

  static async getJSON(ipfsHash: string): Promise<any> {
    try {
      this.initialize();
      const response = await this.pinata.gateways.get(ipfsHash);

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error(`Failed to fetch IPFS data: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error fetching from Pinata:", error);
      return null;
    }
  }
}
