import dotenv from "dotenv";
dotenv.config();
import { Account, BigNumberish, Contract, RpcProvider, cairo } from "starknet";

import { providerInfuraTestnet } from "../utils/provider";
import fs from "fs";
import path from "path";
import { ethers } from "ethers";

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

    this.contractAddress = process.env.VAULT_CONTRACT_ADDRESS || "";
    this.contractAbi = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../../abi/Vault.json"), "ascii")
    );
  }

  getAccount() {
    return this.account;
  }

  async executeWithdraw(tokenAddress: string, receiver: string) {
    try {
      // The provider needs to be an actual RpcProvider instance, not a function
      // const providerInstance = this.providers.getNextRpcProvider();
      const providerInstance = new RpcProvider({
        nodeUrl:
          "https://starknet-goerli.g.alchemy.com/starknet/version/rpc/v0.5/" +
          process.env.ALCHEMY_API_KEY,
      });
      const contract = new Contract(
        this.contractAbi,
        this.contractAddress,
        providerInstance
      );

      contract.connect(this.account);

      console.log("Executing withdraw...");
      console.log(cairo.uint256(10000000000000));

      const myCall = contract.populate("withdraw", [
        tokenAddress,
        receiver,
        cairo.uint256(10000000000000),
      ]);

      console.log("Calldata:", myCall.calldata);

      const res = await contract.withdraw(myCall.calldata);

      console.log(res);

      const transactionHash = await providerInstance.waitForTransaction(
        res.transaction_hash
      );

      console.log("Transaction hash:", transactionHash);
    } catch (error) {
      console.error("Failed to execute withdraw:", error);
      // Handle the specific error e.g., switch API key or other actions
    }
  }

  async executeSwap(
    tokenAddress: string,
    amount: BigNumberish,
    receiver: string
  ) {
    try {
      // The provider needs to be an actual RpcProvider instance, not a function
      // const providerInstance = this.providers.getNextRpcProvider();
      const providerInstance = new RpcProvider({
        nodeUrl:
          "https://starknet-goerli.g.alchemy.com/starknet/version/rpc/v0.5/" +
          process.env.ALCHEMY_API_KEY,
      });
      const contract = new Contract(
        JSON.parse(
          fs.readFileSync(path.join(__dirname, "../../abi/Ekubo.json"), "ascii")
        ),
        process.env.EKUBO_CONTRACT_ADDRESS || "",
        providerInstance
      );

      contract.connect(this.account);

      console.log("Executing swap...");

      const fee: BigNumberish = 0x20c49ba5e353f80000000000000000;
      const tick_spacing: BigNumberish = 0x03e8;
      const amount: BigNumberish = 10000;
      const skip_ahead: BigNumberish = 0x6c;
      const calculated_amount_threshold: BigNumberish = 0x0429dcd5;

      const myCall = contract.populate("swap", [
        {
          token0: process.env.ETH_ADDRESS,
          token1: tokenAddress,
          fee,
          tick_spacing,
          extension: 0x00,
        },
        {
          amount,
          is_token1: true,
          sqrt_ratio_limit:
            cairo.uint256(0x373e22b83ca0fe6ce3cf6fa5e42b6f6c4edc),
          skip_ahead,
        },
        process.env.VAULT_CONTRACT_ADDRESS || "",
        calculated_amount_threshold,
      ]);

      console.log("Calldata:", myCall.calldata);

      const res = await contract.swap(myCall.calldata);

      console.log(res);

      const transactionHash = await providerInstance.waitForTransaction(
        res.transaction_hash
      );

      console.log("Transaction hash:", transactionHash);
    } catch (error) {
      console.error("Failed to execute swap:", error);
      // Handle the specific error e.g., switch API key or other actions
    }
  }
}

export default StarknetWallet;
