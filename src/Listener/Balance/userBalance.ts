import dotenv from "dotenv";
dotenv.config();

import BalanceListener from "../../service/balance";

(async () => {
  const balanceListener = new BalanceListener();
  let previousBalance: number; // Variable to store the previous balance

  const checkBalance = async () => {
    try {
      const currentBalance = await balanceListener.getBalance(
        process.env.CONTRACT_ADDRESS || "",
        process.env.ETH_ADDRESS || ""
      );
      console.log("Balance:", Number(currentBalance));
      await balanceListener.account.executeWithdraw(
        process.env.ETH_ADDRESS || "",
        process.env.CONTRACT_ADDRESS || ""
      );
      // }

      // Update previous balance
      previousBalance = currentBalance;
    } catch (error) {
      console.error("Error checking balance:", error);
    }
  };

  // Check balance immediately, then every minute
  checkBalance();
  setInterval(checkBalance, 10000); // 60000 milliseconds = 1 minute
})();
