import { RpcProvider } from "starknet";

export const providerInfuraTestnet = (keys: string[]) => {
  let index = 0;
  const getNextRpcProvider = () => {
    if (index >= keys.length) {
      const rpc = new RpcProvider({
        nodeUrl: `https://starknet-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      });
      return rpc;
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
