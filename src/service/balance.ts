import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import { Account, Contract, RpcProvider } from "starknet";
import { providerInfuraTestnet } from "../utils/provider";
import StarknetWallet from "./wallet";
import path from "path";

class BalanceListener {
  provider: ReturnType<typeof providerInfuraTestnet>;
  account: StarknetWallet;
  contractAbi: any;

  constructor() {
    const keys = [process.env.API_KEY, process.env.INFURA_API_KEY_2].filter(
      Boolean
    ) as string[];
    this.provider = providerInfuraTestnet(keys);
    this.account = new StarknetWallet(
      process.env.ADDRESS || "",
      process.env.PK || ""
    );
    this.contractAbi = JSON.parse(
      fs
        .readFileSync(path.join(__dirname, "../../abi/ERC20.json"))
        .toString("ascii")
    );
  }

  async getBalance(address: string, tokenAddress: string): Promise<number> {
    try {
      // Attempt to use the current provider
      const provider = this.provider.getNextRpcProvider();
      const contract = new Contract(this.contractAbi, tokenAddress, provider);
      return await contract.balanceOf(address);
    } catch (error: any) {
      if (error.message.includes("fetch failed")) {
        // If the error is related to the limit, try the next key
        console.log("Switching API key due to limit.");
        return this.getBalance(address, tokenAddress); // Recursive call to retry with the next key
      } else {
        // If it's a different kind of error, rethrow it
        throw error;
      }
    }
  }
}

export default BalanceListener;
