import BitcoinLogo from '../assets/bitcoin.svg';
import BnbLogo from '../assets/bnb.svg';
import EthereumLogo from '../assets/ethereum.svg';
import PolygonLogo from '../assets/polygon.svg';
import ZetaChainLogo from '../assets/zetachain.svg';
import SolanaLogo from '../assets/solana.svg';
import ArbitrumLogo from '../assets/arbitrum.svg';
import BaseLogo from '../assets/base.svg';
import AvalancheLogo from '../assets/avalanche.svg';

export const getChainIcon = (chainId: number) => {
  switch (chainId) {
    case  5:
      return EthereumLogo;
    case 80001:
      return PolygonLogo;
    case 97:
      return BnbLogo;
    case 18334:
      return BitcoinLogo;
    case 7001:
      return ZetaChainLogo;
    case 42161:
      return ArbitrumLogo;
    case 56:
      return BnbLogo;
    case 1:
      return EthereumLogo;
    case 900:
      return SolanaLogo;
    case 8453:
      return BaseLogo;
    case 137:
      return PolygonLogo;
    case 43114:
      return AvalancheLogo;
    case 8332:
      return BitcoinLogo;
    default:
      return ZetaChainLogo;
  }
};
