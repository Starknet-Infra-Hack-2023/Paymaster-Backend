import dotenv from "dotenv";
dotenv.config();
import { Account, Contract } from "starknet";
import { providerInfuraTestnet } from "../utils/provider";
import fs from "fs";
import path from "path";

class StarknetWallet {
  private account: Account;
  private address: string;
  private privateKey: string;
  private contractAddress: string;
  private contractAbi: any;
  private providers: ReturnType<typeof providerInfuraTestnet>;

  constructor(address: string, privateKey: string) {
    const keys = [process.env.API_KEY, process.env.INFURA_API_KEY_2].filter(
      Boolean
    ) as string[];
    this.providers = providerInfuraTestnet(keys);

    this.address = address;
    this.privateKey = privateKey;

    // The provider needs to be an actual RpcProvider instance, not a function
    const providerInstance = this.providers.getNextRpcProvider();
    this.account = new Account(providerInstance, this.address, this.privateKey);

    this.contractAddress = process.env.CONTRACT_ADDRESS || "";
    this.contractAbi = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../../abi/Vault.json"), "ascii")
    );
  }

  getAccount() {
    return this.account;
  }

  async executeWithdraw(
    tokenAddress: string,
    receiver: string,
    amount: number
  ) {
    try {
      // The provider needs to be an actual RpcProvider instance, not a function
      const providerInstance = this.providers.getNextRpcProvider();
      const contract = new Contract(
        this.contractAbi,
        this.contractAddress,
        providerInstance
      );

      contract.connect(this.account);

      const myCall = contract.populate("withdraw", [
        tokenAddress,
        receiver,
        amount,
      ]);
      const res = await contract.withdraw(myCall.calldata);

      const transactionHash = await providerInstance.waitForTransaction(
        res.transaction_hash
      );

      console.log("Transaction hash:", transactionHash);
    } catch (error) {
      console.error("Failed to execute withdraw:", error);
      // Handle the specific error e.g., switch API key or other actions
    }
  }
}

export default StarknetWallet;
