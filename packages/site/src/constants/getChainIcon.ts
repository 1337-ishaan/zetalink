import BitcoinLogo from '../assets/bitcoin.svg';
import BnbLogo from '../assets/bnb.svg';
import EthereumLogo from '../assets/ethereum.svg';
import PolygonLogo from '../assets/polygon.svg';
import ZetaChainLogo from '../assets/zetachain.svg';
import SolanaLogo from '../assets/solana.svg';
import ArbitrumLogo from '../assets/arbitrum.svg';
import BaseLogo from '../assets/base.svg';
import AvalancheLogo from '../assets/avalanche.svg';
import TonLogo from '../assets/ton.svg';
import SuiLogo from '../assets/sui.svg';

export const getChainIcon = (chainId: number) => {
  switch (chainId) {
    // Ethereum
    case 1:
    case 5:
    case 11155111: // Sepolia testnet
      return EthereumLogo;

    // Polygon
    case 137:
    case 80001: // Mumbai testnet
    case 80002: // Amoy testnet
      return PolygonLogo;

    // BSC
    case 56:
    case 97: // BSC testnet
      return BnbLogo;

    // Bitcoin
    case 18333: // Bitcoin testnet3
    case 18334: // Bitcoin testnet4
    case 8332:
      return BitcoinLogo;

    // ZetaChain
    case 7001: // Athens testnet
      return ZetaChainLogo;

    // Arbitrum
    case 42161:
    case 421614: // Arbitrum Sepolia testnet
      return ArbitrumLogo;

    // Solana
    case 900:
    case 901: // Solana devnet
      return SolanaLogo;

    // Base
    case 8453:
    case 84532: // Base Sepolia testnet
      return BaseLogo;

    // Avalanche
    case 43114:
    case 43113: // Fuji testnet
      return AvalancheLogo;

    // Ton
    case 2015141: // Ton testnet
    case 49322: // Ton mainnet
      return TonLogo;

    // Sui
    case 103: // Sui testnet
    case 784: // Sui mainnet
      return SuiLogo;

    default:
      return ZetaChainLogo;
  }
};
