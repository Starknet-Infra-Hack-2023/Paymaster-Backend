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
  constructor(address: string, privateKey: string) {
    this.address = address;
    this.privateKey = privateKey;
    this.account = new Account(
      providerInfuraTestnet,
      this.address,
      this.privateKey
    );
    this.contractAddress = process.env.CONTRACT_ADDRESS || "";
    this.contractAbi = JSON.parse(
      fs
        .readFileSync(path.join(__dirname, "../../abi/Vault.json"))
        .toString("ascii")
    );
  }

  getAccount() {
    return this.account;
  }

  async executeWithdraw(
    tokenAddress: string,
    reciever: string,
    amount: number
  ) {
    const contract = new Contract(
      this.contractAbi,
      this.contractAddress,
      providerInfuraTestnet
    );

    contract.connect(this.account);

    const myCall = contract.populate("withdraw", [
      tokenAddress,
      reciever,
      amount,
    ]);
    const res = await contract.withdraw(myCall.calldata);

    const transactionHash = await providerInfuraTestnet.waitForTransaction(
      res.transaction_hash
    );

    console.log("Transaction hash:", transactionHash);
  }
}

export default StarknetWallet;
