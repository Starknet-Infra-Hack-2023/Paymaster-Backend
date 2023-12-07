// import dotenv from "dotenv";
// dotenv.config();

// import { keccak256 } from "js-sha3";
// import fs from "fs";
// import path from "path";
// import { hash, num } from "starknet";
// import { providerInfuraTestnet } from "./provider";
// import StarknetWallet from "./wallet";

// const contractAddress = process.env.CONTRACT_ADDRESS || "";
// // const contractABI = require("../abi/abi.json");

// const lastBlockFile = path.join(__dirname, "../../data/lastBlock.json");

// const getLastProcessedBlock = () => {
//   try {
//     if (fs.existsSync(lastBlockFile)) {
//       const data = fs.readFileSync(lastBlockFile, "utf8");
//       return JSON.parse(data).lastProcessedBlock;
//     }
//   } catch (error) {
//     console.error("Error reading last block file:", error);
//   }
//   return 0; // Default to 0 if file doesn't exist or error occurs
// };

// const saveLastProcessedBlock = (blockNumber: number) => {
//   try {
//     fs.writeFileSync(
//       lastBlockFile,
//       JSON.stringify({ lastProcessedBlock: blockNumber })
//     );
//   } catch (error) {
//     console.error("Error writing last block file:", error);
//   }
// };

// let lastProcessedBlock = getLastProcessedBlock();

// export const Listener = async () => {
//   if (!process.env.CONTRACT_ADDRESS) {
//     throw new Error("Missing contract address");
//   }

//   try {
//     const lastBlock = await providerInfuraTestnet.getBlock("latest");
//     console.log("Last block:", lastBlock);

//     if (lastBlock.block_number > lastProcessedBlock) {
//       // Process only if there's a new block
//       const keyFilter = [
//         num.toHex(hash.starknetKeccak("DepositSuccess")),
//         "0x3add8839758e3959a364fcb0c4dc68ea541281e6c1c480f05bfade5f2443545",
//       ];
//       const eventsList = await providerInfuraTestnet.getEvents({
//         from_block: {
//           block_number: lastProcessedBlock + 1, // Start from the next block after the last processed
//         },
//         to_block: {
//           block_number: lastBlock.block_number,
//         },
//         address: contractAddress,
//         keys: [keyFilter], // Use key filter if required
//         chunk_size: 5,
//       });
//       // Process events here
//       console.log(eventsList);
//       // Get the account
//       const account = new StarknetWallet(
//         process.env.ADDRESS || "",
//         process.env.PRIVATE_KEY || ""
//       ).getAccount();
//       // Update the last processed block
//       lastProcessedBlock = lastBlock.block_number;
//       saveLastProcessedBlock(lastBlock.block_number);
//     }
//   } catch (error) {
//     console.error("Error fetching events:", error);
//   }
// };

// // Polling Interval
// const POLL_INTERVAL = 10000; // 10 seconds

// // Start the listener
// setInterval(Listener, POLL_INTERVAL);

import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import { hash, num, RpcProvider } from "starknet";
import StarknetWallet from "./wallet";
import { providerInfuraTestnet } from "./provider";

class BlockListener {
  lastProcessedBlock: number;
  contractAddress: string;
  provider: RpcProvider;
  lastBlockFile: string;

  constructor() {
    this.provider = providerInfuraTestnet;
    this.contractAddress = process.env.CONTRACT_ADDRESS || "";
    this.lastBlockFile = path.join(__dirname, "../../data/lastBlock.json");
    this.lastProcessedBlock = this.getLastProcessedBlock();
  }

  getLastProcessedBlock(): number {
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
      console.log("Last block:", lastBlock);

      if (lastBlock.block_number > this.lastProcessedBlock) {
        const keyFilter = [
          num.toHex(hash.starknetKeccak("DepositSuccess")),
          "0x3add8839758e3959a364fcb0c4dc68ea541281e6c1c480f05bfade5f2443545",
        ];
        const eventsList = await this.provider.getEvents({
          from_block: {
            block_number: this.lastProcessedBlock + 1,
          },
          to_block: {
            block_number: lastBlock.block_number,
          },
          address: this.contractAddress,
          keys: [keyFilter],
          chunk_size: 5,
        });

        console.log(eventsList);
        this.lastProcessedBlock = lastBlock.block_number;
        this.saveLastProcessedBlock(lastBlock.block_number);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  }

  startPolling(interval: number = 10000): void {
    setInterval(() => this.listenForEvents(), interval);
  }
}

export default BlockListener;
