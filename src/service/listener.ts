import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import { hash, num, RpcProvider } from "starknet";
import { providerInfuraTestnet } from "../utils/provider";

class BlockListener {
  lastProcessedBlock: number;
  contractAddress: string;
  provider: ReturnType<typeof providerInfuraTestnet>;
  lastBlockFile: string;
  pollingInterval: NodeJS.Timeout | null;

  constructor() {
    const keys = [
      process.env.INFURA_API_KEY,
      process.env.INFURA_API_KEY_2,
    ].filter(Boolean) as string[];
    this.provider = providerInfuraTestnet(keys);
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
      const provider = this.provider.getNextRpcProvider();
      const lastBlock = await provider.getBlock("latest");

      if (lastBlock.block_number > this.lastProcessedBlock) {
        const eventsList = await provider.getEvents({
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
    } catch (error: any) {
      console.error("Error fetching events:", error);
      if (error.message.includes("fetch failed")) {
        // If the error is related to the API key limit, switch to the next available key
        console.log("Switching API key due to limit.");
        this.listenForEvents(); // Recursive call to retry with the next key
      }
      // Otherwise, allow the error to be logged and the process to continue
    }
  }

  startPolling(interval: number = 60000): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    this.pollingInterval = setInterval(() => {
      this.listenForEvents().catch(console.error);
    }, interval);
  }
}
export default BlockListener;
