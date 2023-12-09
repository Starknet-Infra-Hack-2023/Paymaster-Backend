import { RpcProvider } from "starknet";

export const providerInfuraTestnet = (keys: string[]) => {
  let index = 0;
  const getNextRpcProvider = () => {
    if (index >= keys.length) {
      throw new Error("All API keys have reached their limit.");
    }
    const rpc = new RpcProvider({
      nodeUrl: `https://starknet-goerli.infura.io/v3/${keys[index]}`,
    });
    index++;
    return rpc;
  };

  return {
    getNextRpcProvider,
  };
};
