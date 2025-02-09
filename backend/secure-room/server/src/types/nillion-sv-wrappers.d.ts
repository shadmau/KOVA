declare module 'nillion-sv-wrappers' {
  interface NillionNode {
    url: string;
    did: string;
  }

  interface NillionWriteResult {
    result?: {
      data?: {
        created?: string[];
      };
    };
  }

  export class SecretVaultWrapper {
    [x: string]: string;
    constructor(
      nodes: NillionNode[], 
      orgCredentials: {
        secretKey: string;
        orgDid: string;
      },
      schemaId: string
    );

    init(): Promise<void>;
    writeToNodes(data: Record<string, any>): Promise<NillionWriteResult[]>;
    readFromNodes(filter: Record<string, any>): Promise<Record<string, any>>;
  }
} 