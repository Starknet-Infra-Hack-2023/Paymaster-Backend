import dotenv from "dotenv";
dotenv.config();
import { Account } from "starknet";
import { providerInfuraTestnet } from "./provider";

class StarknetWallet {
  private account: Account;
  private address: string;
  private privateKey: string;
  constructor(address: string, privateKey: string) {
    this.address = address;
    this.privateKey = privateKey;
    this.account = new Account(
      providerInfuraTestnet,
      this.address,
      this.privateKey
    );
  }

  getAccount() {
    return this.account;
  }
}

export default StarknetWallet;
