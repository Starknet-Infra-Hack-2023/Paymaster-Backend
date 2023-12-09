import dotenv from "dotenv";
dotenv.config();

import BalanceListener from "../../service/balance";

(async () => {
  const balanceListener = new BalanceListener();

  const checkBalance = async () => {
    try {
      const desired_balance = await balanceListener.getBalance(
        process.env.VAULT_ADDRESS || "",
        process.env.ETH_ADDRESS || ""
      );
      console.log("Balance:", Number(desired_balance));
      if (Number(desired_balance) < 1000000000000000) {
        console.log("Balance is less than 0.001");

        //here should call the ML Model to predict what decision to make

        //swap
        await balanceListener.account.executeSwap(
          process.env.TOKEN_CONTRACT_ADDRESS || "",
          10000,
          process.env.VAULT_CONTRACT_ADDRESS || ""
        );
      }
    } catch (error) {
      console.error("Error checking balance:", error);
    }
  };

  // Check balance immediately, then every minute
  checkBalance();
  setInterval(checkBalance, 60000); // 60000 milliseconds = 1 minute
})();
