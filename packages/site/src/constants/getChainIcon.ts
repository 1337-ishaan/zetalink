import BitcoinLogo from '../assets/bitcoin.svg';
import BnbLogo from '../assets/bnb.svg';
import EthereumLogo from '../assets/ethereum.svg';
import PolygonLogo from '../assets/polygon.svg';
import ZetaChainLogo from '../assets/zetachain.svg';

export const getChainIcon = (chainId: number) => {
  switch (chainId) {
    case 11155111 || 5:
      return EthereumLogo;
    case 80001:
      return PolygonLogo;
    case 97:
      return BnbLogo;
    case 18332:
      return BitcoinLogo;
    case 7001:
      return ZetaChainLogo;
    default:
      return ZetaChainLogo;
  }
};
