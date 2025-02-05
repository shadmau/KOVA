
import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';
import { json } from '@helia/json';
import { toString as uint8ArrayToString } from 'uint8arrays/to-string';

export class IPFSService {
  private static helia: any;
  private static fs: any;
  private static jsonHandler: any;

  private static async initialize() {
    if (!this.helia) {
      this.helia = await createHelia();
      this.fs = unixfs(this.helia);
      this.jsonHandler = json(this.helia);
    }
  }

  static async uploadJSON(data: any): Promise<string> {
    await this.initialize();
    const cid = await this.jsonHandler.add(data);
    return cid.toString();
  }

  static async uploadFile(file: File): Promise<string> {
    await this.initialize();
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    const cid = await this.fs.addBytes(uint8Array);
    return cid.toString();
  }

  static async getData(cid: string): Promise<any> {
    await this.initialize();
    try {
      return await this.jsonHandler.get(cid);
    } catch (error) {
      console.error('Error getting data from IPFS:', error);
      throw error;
    }
  }

  static async getFile(cid: string): Promise<Uint8Array> {
    await this.initialize();
    try {
      const chunks = [];
      for await (const chunk of this.fs.cat(cid)) {
        chunks.push(chunk);
      }
      return new Uint8Array(Buffer.concat(chunks));
    } catch (error) {
      console.error('Error getting file from IPFS:', error);
      throw error;
    }
  }
}
