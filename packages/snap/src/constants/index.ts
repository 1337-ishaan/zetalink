import { ECPairFactory } from 'ecpair';
import * as ecc from '@bitcoinerlab/secp256k1';

const ECPair = ECPairFactory(ecc);

const CRYPTO_CURVE = 'secp256k1';
const DERIVATION_PATH = ['m', "44'", "0'", "0'", '0', '0'];


// Zetachain addresses
const MAINNET_ZETA_TSS ='bc1qm24wp577nk8aacckv8np465z3dvmu7ry45el6y';
const TESTNET_ZETA_TSS='tb1qy9pqmk2pd9sv63g27jt8r657wy0d9ueeh0nqur';

// APIs
const TESTNET_BLOCKSTREAM_API = `https://blockstream.info/testnet/api`;
const MAINNET_BLOCKSTREAM_API = `https://blockstream.info/api`;

const TESTNET_BLOCKCYPHER_API = `https://api.blockcypher.com/v1/btc/test3`;
const MAINNET_BLOCKCYPHER_API = `https://api.blockcypher.com/v1/btc/main`;

const TESTNET_MEMPOOL = `https://mempool.space/testnet/api`;
const MAINNET_MEMPOOL = `https://mempool.space/api`;


const TESTNET_ZETA_BLOCKPI="https://zetachain-athens.blockpi.network/lcd/v1"///afa7758ad026d7ae54ff629af5883f53bdd82d73"; // !TODO: Use  BLOCKPI_API from .env
const MAINNET_ZETA_BLOCKPI="https://zetachain.blockpi.network/lcd/v1"///afa7758ad026d7ae54ff629af5883f53bdd82d73";

const TESTNET_ZETA_BLOCKSCOUT = 'https://zetachain-athens-3.blockscout.com/api/v2';
const MAINNET_ZETA_BLOCKSCOUT = 'https://zetachain.blockscout.com/api/v2';

const OMNICHAIN_SWAP_CONTRACT_ADDRESS =
  '0x102Fa443F05200bB74aBA1c1F15f442DbEf32fFb';

const ACTION_CODE = '01';


export {
  ECPair,
  CRYPTO_CURVE,
  DERIVATION_PATH,
  TESTNET_BLOCKSTREAM_API,
  TESTNET_BLOCKCYPHER_API,
  MAINNET_BLOCKCYPHER_API,
  MAINNET_BLOCKSTREAM_API,
  MAINNET_MEMPOOL,
  TESTNET_MEMPOOL,
  MAINNET_ZETA_TSS,
  TESTNET_ZETA_TSS,
  TESTNET_ZETA_BLOCKPI,
  MAINNET_ZETA_BLOCKPI,
  TESTNET_ZETA_BLOCKSCOUT,
  MAINNET_ZETA_BLOCKSCOUT,
  OMNICHAIN_SWAP_CONTRACT_ADDRESS,
  ACTION_CODE
};
