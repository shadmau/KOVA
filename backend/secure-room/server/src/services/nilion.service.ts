import { BaseService } from "./base.service.js";
import { SecretVaultWrapper } from "nillion-sv-wrappers";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

// Initialize dotenv
dotenv.config(); //! to remove

const NILION_ORG_ID = process.env.NILION_ORG_ID;
const NILION_SECRET_KEY = process.env.NILION_SECRET_KEY;
const TRADER_SCHEMA_ID = process.env.NILION_TRADER_SCHEMA_ID;
const INVESTOR_SCHEMA_ID = process.env.NILION_INVESTOR_SCHEMA_ID;

if (!NILION_ORG_ID || !NILION_SECRET_KEY || !TRADER_SCHEMA_ID || !INVESTOR_SCHEMA_ID) {
  throw new Error("Nilion credentials or schema IDs are not set in environment variables");
}

const nodes = [
  {
    url: "https://nildb-zy8u.nillion.network",
    did: "did:nil:testnet:nillion1fnhettvcrsfu8zkd5zms4d820l0ct226c3zy8u",
  },
  {
    url: "https://nildb-rl5g.nillion.network",
    did: "did:nil:testnet:nillion14x47xx85de0rg9dqunsdxg8jh82nvkax3jrl5g",
  },
  {
    url: "https://nildb-lpjp.nillion.network",
    did: "did:nil:testnet:nillion167pglv9k7m4gj05rwj520a46tulkff332vlpjp",
  },
];

export enum SchemaType {
  TRADER = 'trader',
  INVESTOR = 'investor'
}

export class NilionService extends BaseService {
  private static instance: NilionService;
  private isInitialized: boolean = false;
  private isRunning: boolean = false;
  private collections: Map<SchemaType, SecretVaultWrapper> = new Map();

  private constructor() {
    super();
  }

  public static getInstance(): NilionService {
    if (!NilionService.instance) {
      console.log("NilionService instance not found, creating new instance");
      NilionService.instance = new NilionService();
    }
    return NilionService.instance;
  }

  private getSchemaId(type: SchemaType): string {
    switch (type) {
      case SchemaType.TRADER:
        return TRADER_SCHEMA_ID!;
      case SchemaType.INVESTOR:
        return INVESTOR_SCHEMA_ID!;
      default:
        throw new Error(`Unknown schema type: ${type}`);
    }
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialize both collections
      const traderCollection = new SecretVaultWrapper(
        nodes,
        {
          secretKey: NILION_SECRET_KEY!,
          orgDid: NILION_ORG_ID!
        },
        TRADER_SCHEMA_ID!
      );
      await traderCollection.init();
      this.collections.set(SchemaType.TRADER, traderCollection);

      const investorCollection = new SecretVaultWrapper(
        nodes,
        {
          secretKey: NILION_SECRET_KEY!,
          orgDid: NILION_ORG_ID!
        },
        INVESTOR_SCHEMA_ID!
      );
      await investorCollection.init();
      this.collections.set(SchemaType.INVESTOR, investorCollection);

      this.isInitialized = true;
      console.log('NilionService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize NilionService:', error);
      throw error;
    }
  }

  public async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    try {
      await this.initialize();
      this.isRunning = true;
      console.log('NilionService started successfully');
    } catch (error) {
      console.error('Failed to start NilionService:', error);
      throw error;
    }
  }

  public async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      this.collections.clear();
      this.isRunning = false;
      this.isInitialized = false;
      console.log('NilionService stopped successfully');
    } catch (error) {
      console.error('Failed to stop NilionService:', error);
      throw error;
    }
  }

  public async encryptData(data: any, type: SchemaType): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('NilionService must be initialized before use');
    }

    const collection = this.collections.get(type);
    if (!collection) {
      throw new Error(`Collection not found for schema type: ${type}`);
    }

    try {
      const dataToEncrypt = {
        _id: uuidv4(),
        ...data,
        timestamp: Date.now()
      };

      const dataWritten = await collection.writeToNodes([dataToEncrypt]);
      
      const createdIds: string[] = [];
      dataWritten.forEach((res) => {
        const createdArr = res?.result?.data?.created;
        if (Array.isArray(createdArr)) {
          createdArr.forEach((id) => createdIds.push(id));
        }
      });

      const recordId = createdIds[0];
      if (!recordId) {
        throw new Error("No record ID created by SecretVault!");
      }

      const nillionUri = `nillion://${NILION_ORG_ID}/${this.getSchemaId(type)}/${recordId}`;
      return nillionUri;
    } catch (error) {
      console.error('Failed to encrypt data:', error);
      throw error;
    }
  }

  public async decryptData(nillionUri: string): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('NilionService must be initialized before use');
    }

    try {
      const uriParts = nillionUri.replace("nillion://", "").split("/");
      const schemaId = uriParts[1];
      const recordId = uriParts[2];
      
      // Find the correct collection based on schema ID
      const collection = Array.from(this.collections.values()).find(c => c.schemaId === schemaId);
      if (!collection) {
        throw new Error(`No collection found for schema ID: ${schemaId}`);
      }

      const filter = { _id: recordId };
      const decryptedData = await collection.readFromNodes(filter);
      return decryptedData;
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      throw error;
    }
  }
}