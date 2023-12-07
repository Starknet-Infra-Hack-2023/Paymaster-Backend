import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import { Account, Contract, RpcProvider } from "starknet";
import { providerInfuraTestnet } from "./provider";
import StarknetWallet from "./wallet";

class BalanceListener {
  contractAddress: string;
  provider: RpcProvider;
  account: StarknetWallet;
  contractAbi: any;

  constructor() {
    this.provider = providerInfuraTestnet;
    this.contractAddress = process.env.CONTRACT_ADDRESS || "";
    this.account = new StarknetWallet(
      process.env.ADDRESS || "",
      process.env.PRIVATE_KEY || ""
    );
    this.contractAbi = JSON.parse(
      fs.readFileSync("../../abi/ERC20.json").toString("ascii")
    );
  }

  async getBalance(address: string): Promise<number> {
    const contract = new Contract(
      this.contractAbi,
      this.contractAddress,
      providerInfuraTestnet
    );

    const res = await contract.balance_of(address);
    return res;
  }
}
