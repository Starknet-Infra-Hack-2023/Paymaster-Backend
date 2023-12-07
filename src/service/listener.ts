import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import { hash, num, RpcProvider } from "starknet";
import { providerInfuraTestnet } from "./provider";

class BlockListener {
  lastProcessedBlock: number;
  contractAddress: string;
  provider: RpcProvider;
  lastBlockFile: string;
  pollingInterval: NodeJS.Timeout | null;

  constructor() {
    this.provider = providerInfuraTestnet;
    this.contractAddress = process.env.CONTRACT_ADDRESS || "";
    this.lastBlockFile = path.join(__dirname, "../../data/lastBlock.json");
    this.lastProcessedBlock = this.readLastProcessedBlock();
    this.pollingInterval = null;
    process.on("SIGINT", this.handleShutdown.bind(this));
    process.on("SIGTERM", this.handleShutdown.bind(this));
  }

  readLastProcessedBlock(): number {
    try {
      if (fs.existsSync(this.lastBlockFile)) {
        const data = fs.readFileSync(this.lastBlockFile, "utf8");
        return JSON.parse(data).lastProcessedBlock;
      }
    } catch (error) {
      console.error("Error reading last block file:", error);
    }
    return 0;
  }

  handleShutdown() {
    console.log("Saving last processed block before shutdown...");
    this.saveLastProcessedBlock(this.lastProcessedBlock);
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    process.exit(0);
  }

  saveLastProcessedBlock(blockNumber: number): void {
    try {
      fs.writeFileSync(
        this.lastBlockFile,
        JSON.stringify({ lastProcessedBlock: blockNumber })
      );
    } catch (error) {
      console.error("Error writing last block file:", error);
    }
  }

  async listenForEvents(): Promise<void> {
    if (!this.contractAddress) {
      throw new Error("Missing contract address");
    }

    try {
      const lastBlock = await this.provider.getBlock("latest");
      if (lastBlock.block_number > this.lastProcessedBlock) {
        const eventsList = await this.provider.getEvents({
          from_block: { block_number: this.lastProcessedBlock + 1 },
          to_block: { block_number: lastBlock.block_number },
          address: this.contractAddress,
          keys: [], // Assuming you want to filter events; modify as needed
          chunk_size: 5,
        });

        if (eventsList.events.length > 0) {
          console.log("Events:", eventsList.events[0].data);
        }
        this.lastProcessedBlock = lastBlock.block_number;
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  }

  startPolling(interval: number = 10000): void {
    this.pollingInterval = setInterval(async () => {
      await this.listenForEvents();
    }, interval);
  }
}

export default BlockListener;
