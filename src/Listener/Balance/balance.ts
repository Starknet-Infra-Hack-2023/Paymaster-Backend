import dotenv from "dotenv";
dotenv.config();

import BalanceListener from "../../service/balance";

(async () => {
  const balanceListener = new BalanceListener();

  const checkBalance = async () => {
    try {
      const desired_balance = await balanceListener.getBalance(
        process.env.CONTRACT_ADDRESS || ""
      );
      console.log("Balance:", Number(desired_balance));
      if (Number(desired_balance) < 30) {
        console.log("Balance is less than 30");
        //if balance less than 30 it will need to check the ETH Balance
        const eth_balance = await balanceListener.getBalance(
          process.env.ETH_ADDRESS || ""
        );
        console.log("ETH Balance:", Number(eth_balance));

        if (Number(eth_balance) < 0.1) {
          console.log("ETH Balance is less than 0.1");
        }

        //if ETH Balance is less than 0.1

        //if ETH Balance is more than 0.1

        //if balance is more than 30 it will need to check the ETH Balance

        //here should call the ML Model to predict what decision to make
      }
    } catch (error) {
      console.error("Error checking balance:", error);
    }
  };

  // Check balance immediately, then every minute
  checkBalance();
  setInterval(checkBalance, 60000); // 60000 milliseconds = 1 minute
})();
