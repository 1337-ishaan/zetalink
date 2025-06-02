export interface EvmChainConfig {
  chainId: number; // chain ID for Covalent or similar APIs
  name: string;
  symbol: string;
  rpcUrl: string;
  geckoId: string;
}

export const EVM_CHAINS: EvmChainConfig[] = [
  {
    chainId: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    rpcUrl:
      process.env.REACT_APP_ETH_RPC_URL ||
      'https://mainnet.infura.io/v3/6d44788638584bcfb3ae8a4accf85132',
    geckoId: 'ethereum',
  },
  {
    chainId: 56,
    name: 'BNB Smart Chain',
    symbol: 'BNB',
    rpcUrl:
      process.env.REACT_APP_BSC_RPC_URL ||
      'https://bsc-dataseed.binance.org/',
    geckoId: 'binance-smart-chain',
  },
  {
    chainId: 137,
    name: 'Polygon',
    symbol: 'MATIC',
    rpcUrl:
      process.env.REACT_APP_POLYGON_RPC_URL ||
      'https://polygon-rpc.com/',
    geckoId: 'polygon-pos',
  },

  {
    chainId: 8453,
    name: 'Base',
    symbol: 'ETH',
    rpcUrl:
      process.env.REACT_APP_BASE_RPC_URL ||
      'https://base-mainnet.infura.io/v3/6d44788638584bcfb3ae8a4accf85132',
    geckoId: 'ethereum',
  },
  // Add more supported chains here, based on the list from ZetaChain:
  // https://www.zetachain.com/docs/developers/chains/list/
]; 