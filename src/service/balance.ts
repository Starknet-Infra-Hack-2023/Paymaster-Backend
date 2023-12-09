import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import { Account, Contract, RpcProvider } from "starknet";
import { providerInfuraTestnet } from "../utils/provider";
import StarknetWallet from "./wallet";
import path from "path";

class BalanceListener {
  tokenContractAddress: string;
  provider: RpcProvider;
  account: StarknetWallet;
  contractAbi: any;

  constructor() {
    this.provider = providerInfuraTestnet;
    this.tokenContractAddress = process.env.TOKEN_CONTRACT_ADDRESS || "";
    this.account = new StarknetWallet(
      process.env.ADDRESS || "",
      process.env.PRIVATE_KEY || ""
    );
    this.contractAbi = JSON.parse(
      fs
        .readFileSync(path.join(__dirname, "../../abi/ERC20.json"))
        .toString("ascii")
    );
  }

  async getBalance(address: string): Promise<number> {
    const contract = new Contract(
      this.contractAbi,
      this.tokenContractAddress,
      providerInfuraTestnet
    );

    const res = await contract.balance_of(address);
    return res;
  }
}

export default BalanceListener;
