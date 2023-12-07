import dotenv from "dotenv";
dotenv.config();

import { RpcProvider } from "starknet";

export const providerInfuraTestnet = new RpcProvider({
  nodeUrl: "https://starknet-goerli.infura.io/v3/" + process.env.INFURA_API_KEY,
});
