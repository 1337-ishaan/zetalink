import { Box, Link, Heading, Text } from '@metamask/snaps-sdk/jsx';
import { bech32 } from 'bech32';
import * as bitcoin from 'bitcoinjs-lib';
import { Buffer } from 'buffer';

import { btcToSats, satsToBtc } from './utils/satConverter';
import {
  TESTNET_BLOCKCYPHER_API,
  MAINNET_BLOCKCYPHER_API,
  CRYPTO_CURVE,
  DERIVATION_PATH,
  ECPair,
  TESTNET_MEMPOOL,
  MAINNET_MEMPOOL,
  TESTNET_ZETA_BLOCKPI,
  MAINNET_ZETA_BLOCKPI,
  TESTNET_ZETA_BLOCKSCOUT,
  MAINNET_ZETA_BLOCKSCOUT,
  MAINNET_ZETA_TSS,
  TESTNET_ZETA_TSS,
  TESTNET_OMNICHAIN_SWAP_CONTRACT_ADDRESS,
  MAINNET_OMNICHAIN_SWAP_CONTRACT_ADDRESS,
  ACTION_CODE,
} from '../constants';

let isMainnet = false;

// Add persistent storage helpers
async function saveNetworkMode(mode: boolean): Promise<void> {
  await snap.request({
    method: 'snap_manageState',
    params: {
      operation: 'update',
      newState: { isMainnet: mode },
    },
  });
}

async function loadNetworkMode(): Promise<boolean> {
  const state = await snap.request({
    method: 'snap_manageState',
    params: { operation: 'get' },
  });
  return state && typeof state.isMainnet === 'boolean'
    ? state.isMainnet
    : false;
}

/**
 * Converts an Ethereum address to a Zeta address and vice versa.
 *
 * @param address - The Ethereum or Zeta address to convert.
 * @returns The converted address in Zeta format or Ethereum format.
 */
const convertToZeta = (address: string): string => {
  try {
    if (address.startsWith('0x')) {
      const data = Buffer.from(trimHexPrefix(address), 'hex');
      return bech32.encode('zeta', bech32.toWords(data));
    }
    const decoded = bech32.decode(address);
    return `0x${Buffer.from(bech32.fromWords(decoded.words)).toString('hex')}`;
  } catch (error) {
    console.error('Error converting EVM address to Zeta:', error);
    throw new Error('Conversion to Zeta failed.');
  }
};

/**
 * Trims the '0x' prefix from a hex string if it exists.
 *
 * @param key - The hex string to trim.
 * @returns The trimmed hex string.
 */
export function trimHexPrefix(key: string): string {
  return key.startsWith('0x') ? key.substring(2) : key;
}

/**
 * Creates a Bitcoin testnet address from the BIP32 public key.
 *
 * @param request - The snap request object containing the network flag.
 * @returns The generated Bitcoin testnet address.
 */
export const deriveBtcWallet = async (request: any): Promise<string> => {
  isMainnet = Boolean(request.params[0]);
  await saveNetworkMode(isMainnet);

  try {
    const slip10Node = await snap.request({
      method: 'snap_getBip32PublicKey',
      params: {
        path: DERIVATION_PATH,
        curve: CRYPTO_CURVE,
        compressed: true,
      },
    });

    if (slip10Node) {
      const { address: btcAddress } = bitcoin.payments.p2wpkh({
        pubkey: Buffer.from(trimHexPrefix(slip10Node), 'hex'),
        network: isMainnet
          ? bitcoin.networks.bitcoin
          : bitcoin.networks.testnet,
      });
      return btcAddress as string;
    }
    throw new Error('Failed to create Bitcoin testnet address.');
  } catch (error) {
    console.error('Error creating Bitcoin testnet address:', error);
    throw new Error('Failed to create Bitcoin testnet address.');
  }
};

/**
 * Fetches BTC transactions for the connected account.
 *
 * @returns An object containing UTXO data.
 */
export const getBtcTrxs = async (): Promise<any[]> => {
  isMainnet = await loadNetworkMode();

  try {
    const slip10Node = await snap.request({
      method: 'snap_getBip32PublicKey',
      params: {
        path: DERIVATION_PATH,
        curve: CRYPTO_CURVE,
        compressed: true,
      },
    });

    if (slip10Node) {
      const { address: btcAddress } = bitcoin.payments.p2wpkh({
        pubkey: Buffer.from(trimHexPrefix(slip10Node), 'hex'),
        network: isMainnet
          ? bitcoin.networks.bitcoin
          : bitcoin.networks.testnet,
      });

      const utxo = await fetch(
        `${
          isMainnet ? MAINNET_MEMPOOL : TESTNET_MEMPOOL
        }/address/${btcAddress}/txs`,
      );

      const utxoData = await utxo.json();

      return utxoData ?? [];
    }
    throw new Error('Failed to create Bitcoin testnet address.');
  } catch (error) {
    console.error('Error getting BTC UTXOs:', error);
    throw new Error('Failed to retrieve Bitcoin UTXOs.');
  }
};

/**
 * Retrieves current Bitcoin transaction depositFees.
 *
 * @returns An object containing depositFee data.
 */
export const getFees = async (): Promise<{
  btcFees: number;
  zetaDepositFees: number;
}> => {
  isMainnet = await loadNetworkMode();

  try {
    const fee = await fetch(
      `${isMainnet ? MAINNET_MEMPOOL : TESTNET_MEMPOOL}/v1/fees/recommended`,
      // `${isMainnet ? MAINNET_BLOCKCYPHER_API : TESTNET_BLOCKCYPHER_API}`,
    );
    if (!fee.ok) {
      throw new Error('Failed to fetch depositFees.');
    }
    const feeData = await fee.json();
    console.log('feeData', feeData);
    return {
      btcFees: feeData.fastestFee,
      zetaDepositFees: feeData.fastestFee * 1000 * 68 * 2,
    };
  } catch (error) {
    console.error('Error getting depositFees:', error);
    throw new Error('Failed to retrieve depositFees.');
  }
};

/**
 * Broadcasts a Bitcoin transaction to the network.
 *
 * @param txHex - The transaction hex string to broadcast.
 * @returns The transaction ID after broadcasting.
 */
const broadcastTransaction = async (txHex: string): Promise<string> => {
  try {
    // Broadcast via mempool.space only
    const response = await fetch(
      `${isMainnet ? MAINNET_MEMPOOL : TESTNET_MEMPOOL}/tx`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: txHex,
      },
    );
    const txData = await response.text();

    await snap.request({
      method: 'snap_dialog',
      params: {
        type: 'alert',
        content: (
          <Box>
            <Heading>Track you CCTX transaction</Heading>
            <Link
              href={`${
                isMainnet
                  ? 'https://mempool.space'
                  : 'https://mempool.space/testnet4'
              }/tx/${txData}`}
            >
              Mempool
            </Link>
            <Text>Refresh your transactions</Text>
          </Box>
        ),
      },
    });

    return txData;
  } catch (error) {
    console.error('Error broadcasting transaction:', error);
    throw new Error('Transaction broadcast failed.');
  }
};

/**
 * Fetches unspent transaction outputs (UTXOs) for a specific Bitcoin address.
 *
 * @returns The UTXO data.
 */
export const fetchUtxo = async (): Promise<any> => {
  isMainnet = await loadNetworkMode();

  try {
    const slip10Node = await snap.request({
      method: 'snap_getBip32PublicKey',
      params: {
        path: DERIVATION_PATH,
        curve: CRYPTO_CURVE,
        compressed: true,
      },
    });

    if (slip10Node) {
      const { address: btcAddress } = bitcoin.payments.p2wpkh({
        pubkey: Buffer.from(trimHexPrefix(slip10Node), 'hex'),
        network: isMainnet
          ? bitcoin.networks.bitcoin
          : bitcoin.networks.testnet,
      });
      const utxo = await fetch(
        `${
          isMainnet ? MAINNET_MEMPOOL : TESTNET_MEMPOOL
        }/address/${btcAddress}/utxo`,
      );

      const utxoData = await utxo.json();
      return utxoData;
    }
    throw new Error('Failed to fetch UTXO.');
  } catch (error) {
    console.error('Error fetching UTXO:', error);
    throw new Error('Failed to fetch UTXO.');
  }
};

/**
 * Executes a cross-chain swap transaction for Bitcoin.
 *
 * @param request - The request object containing transaction parameters.
 * @returns The transaction ID after broadcasting.
 */

export const transactBtc = async (request: any): Promise<string> => {
  isMainnet = await loadNetworkMode();

  if (!request?.params) {
    throw new Error('Invalid request: missing params');
  }

  const [
    customMemo,
    depositFeeRaw,
    recipientAddress,
    ZRC20ContractAddress,
    transferAmountRaw,
  ] = request.params;

  const interfaceId = await snap.request({
    method: 'snap_createInterface',
    params: {
      ui: (
        <Box>
          <Heading>Confirm CCTX BTC transaction:</Heading>
          <Text>Transfer Amount - {`${transferAmountRaw}`} BTC</Text>
          <Text>ZRC20 Contract Address - {`${ZRC20ContractAddress}`}</Text>
          <Text>Recipient Address - {`${recipientAddress}`}</Text>
          <Text>Deposit Fees - {`${satsToBtc(depositFeeRaw)}`} BTC</Text>
        </Box>
      ),
    },
  });

  if (!interfaceId) {
    throw new Error('Failed to create interface');
  }

  const result = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      id: interfaceId,
    },
  });

  if (result) {
    const depositFee: {
      zetaDepositFees: number;
      btcFees: number;
    } = await getFees();

    // Convert requested BTC amount to satoshis (no manual subtractions)
    const amountSats = Math.floor(btcToSats(parseFloat(transferAmountRaw)));

    let generatedMemo;

    try {
      const slip10Node = await snap.request({
        method: 'snap_getBip32Entropy',
        params: {
          path: DERIVATION_PATH,
          curve: CRYPTO_CURVE,
        },
      });

      if (!slip10Node?.publicKey || !slip10Node?.privateKey) {
        throw new Error('Failed to retrieve key information');
      }

      const privateKeyBuffer = Buffer.from(
        trimHexPrefix(slip10Node.privateKey),
        'hex',
      );

      const keypair = ECPair.fromPrivateKey(privateKeyBuffer);

      const { address: btcAddress } = bitcoin.payments.p2wpkh({
        pubkey: keypair.publicKey,
        network: isMainnet
          ? bitcoin.networks.bitcoin
          : bitcoin.networks.testnet,
      });

      try {
        if (!recipientAddress || !btcAddress) {
          throw new Error('ZETA or BTC Address undefined.');
        }

        const trimmedSanitizedRecipientAddress = trimHexPrefix(
          recipientAddress,
        );
        const trimmedSanitizedZRC20ContractAddress = trimHexPrefix(
          ZRC20ContractAddress,
        );
        const trimmedOmnichainContract = trimHexPrefix(
          isMainnet
            ? MAINNET_OMNICHAIN_SWAP_CONTRACT_ADDRESS
            : TESTNET_OMNICHAIN_SWAP_CONTRACT_ADDRESS,
        );

        const isValidHex = (str: string) => /^[0-9a-f]*$/i.test(str);
        if (
          !isValidHex(trimmedSanitizedRecipientAddress) ||
          !isValidHex(trimmedSanitizedZRC20ContractAddress) ||
          !isValidHex(trimmedOmnichainContract)
        ) {
          throw new Error('Addresses must contain valid hex characters only');
        }

        console.log('Address validation passed');
        if (ZRC20ContractAddress) {
          // Just the params the contract expects - no contract address or action code
          generatedMemo = `${trimmedOmnichainContract}${trimmedSanitizedZRC20ContractAddress}${trimmedSanitizedRecipientAddress}`;

          // Add withdraw flag if needed (01 for true, 00 for false)
          const withdrawFlag = '01'; // or "00" if not withdrawing
          generatedMemo += withdrawFlag;
        } else {
          generatedMemo = trimmedSanitizedRecipientAddress;
        }
      } catch {
        throw new Error('Error creating memo, please try again');
      }

      if (!btcAddress) {
        throw new Error('Failed to generate Bitcoin Address');
      }

      const utxos = await fetchUtxo();

      if (!utxos || utxos.length === 0) {
        throw new Error('No UTXOs found');
      }

      const memoBuffer = Buffer.from(
        customMemo && Boolean(ZRC20ContractAddress)
          ? customMemo
          : generatedMemo,
        'hex',
      );

      if (memoBuffer.length >= 78) {
        throw new Error('Memo too long');
      }

      utxos.sort(
        (a: { value: number }, b: { value: number }) => a.value - b.value,
      );

      if (typeof depositFee?.zetaDepositFees !== 'number') {
        throw new Error('Invalid deposit fee type');
      }

      // Select UTXOs and estimate on-chain network fee based on vsize
      const zetaDepositFees = depositFee.zetaDepositFees;
      const feeRate = depositFee.btcFees; // sats per vByte
      // Boost fee rate for immediate inclusion
      const priorityMultiplier = isMainnet ? 2 : 5;
      const effectiveFeeRate = feeRate * priorityMultiplier;
      let sum = 0;
      const pickUtxos = [];
      let networkFee = 0;

      for (const utxo of utxos) {
        sum += utxo.value;
        pickUtxos.push(utxo);
        const inputCount = pickUtxos.length;
        const hasEmbed = memoBuffer.length > 0;
        const hasChange = sum > amountSats + zetaDepositFees;
        const outputCount = 1 + (hasEmbed ? 1 : 0) + (hasChange ? 1 : 0);
        // Estimate vsize: inputs * 68 vB + outputs * 31 vB + embed data bytes
        const estimatedVsize =
          inputCount * 68 + outputCount * 31 + memoBuffer.length;
        networkFee = Math.ceil(effectiveFeeRate * estimatedVsize);
        const totalNeeded = amountSats + zetaDepositFees + networkFee;
        if (sum >= totalNeeded) {
          break;
        }
      }

      if (sum < amountSats + zetaDepositFees + networkFee) {
        throw new Error('Not enough funds');
      }

      const change = sum - (amountSats + zetaDepositFees + networkFee);
      const txs = [];

      for (const utxo of pickUtxos) {
        const p1 = await fetch(
          `${isMainnet ? MAINNET_MEMPOOL : TESTNET_MEMPOOL}/tx/${utxo.txid}`,
        );
        if (!p1.ok) {
          continue;
        }
        const data = await p1.json();
        txs.push(data);
      }

      const psbt = new bitcoin.Psbt({
        network: isMainnet
          ? bitcoin.networks.bitcoin
          : bitcoin.networks.testnet,
      });

      psbt.setVersion(2);

      psbt.addOutput({
        address: isMainnet ? MAINNET_ZETA_TSS : TESTNET_ZETA_TSS,
        value: amountSats + zetaDepositFees,
      });

      if (memoBuffer.length > 0) {
        const embed = bitcoin.payments.embed({
          data: [memoBuffer],
        });
        if (!embed.output) {
          throw new Error('Unable to embed memo');
        }
        psbt.addOutput({ script: embed.output, value: 0 });
      }

      if (change > 0) {
        psbt.addOutput({ address: btcAddress, value: change });
      }

      for (let i = 0; i < pickUtxos.length; i++) {
        const utxo = pickUtxos[i];
        const tx = txs[i];

        const inputData = {
          hash: tx.txid,
          index: utxo.vout,
          sequence: 0xfffffffd,
          witnessUtxo: {
            script: Buffer.from(tx.vout[utxo.vout].scriptpubkey, 'hex'),
            value: utxo.value,
          },
        };
        psbt.addInput(inputData as any);
      }
      for (let i = 0; i < pickUtxos.length; i++) {
        psbt.signInput(i, keypair);
      }

      try {
        psbt.finalizeAllInputs();
        const tx = psbt.extractTransaction().toHex();
        const broadcastResult = await broadcastTransaction(tx);
        if (!broadcastResult) {
          throw new Error('Failed to broadcast transaction');
        }
        return broadcastResult;
      } catch (error) {
        console.error('Error in finalizing or extracting transaction:', error);
        if (
          error instanceof TypeError &&
          error.message.includes('Cannot read properties of null')
        ) {
          console.error('Detailed error:', JSON.stringify(psbt.data));
        }
        throw error;
      }
    } catch (error) {
      console.error('Error during cross-chain swap:', error);
      throw new Error(`Cross-chain swap failed. ${error}`);
    }
  } else {
    throw new Error('User Rejected');
  }
};

/**
 * Tracks a cross-chain transaction given its inbound transaction hash.
 *
 * @param request - The request object containing the inbound transaction hash as request.params[0],
 *                  typically the observed_hash from the inbound_params of the CrossChainTx.
 * @returns The detailed CCTX data fetched by its cctx index.
 */
export const trackCctxTx = async (request: any): Promise<any> => {
  isMainnet = await loadNetworkMode();

  const rawHash = request.params?.[0];
  if (!rawHash) {
    throw new Error('Missing transaction hash parameter');
  }
  const txHash = trimHexPrefix(rawHash);
  const baseUrl = isMainnet ? MAINNET_ZETA_BLOCKPI : TESTNET_ZETA_BLOCKPI;
  const projectId = 'afa7758ad026d7ae54ff629af5883f53bdd82d73';

  // Fetch CCTX index using inbound transaction hash
  const indexUrl = `${baseUrl}/public/zeta-chain/crosschain/inboundHashToCctxData/${txHash}`;
  const indexResp = await fetch(indexUrl);
  if (!indexResp.ok) {
    throw new Error(
      `Failed to fetch CCTX index from ${indexUrl}: ${indexResp.status} ${indexResp.statusText}`,
    );
  }
  const indexData = await indexResp.json();
  return indexData;
};

/**
 * Retrieves the balance for a given EVM address and exchange_rate.
 *
 * @param request - The request object containing the EVM address.
 * @returns An object containing Zeta, non-Zeta balances and prices.
 */
export const getBalanceAndRate = async (
  request: any,
): Promise<{
  zeta: any;
  nonZeta: any;
  zetaPrice: number;
  btcPrice: number;
}> => {
  isMainnet = await loadNetworkMode();

  try {
    if (request.params[0]) {
      const zetaAddr = convertToZeta(request.params[0]);
      let zetaData, nonZetaData, btcPrice, zetaPrice;

      try {
        const zeta = await fetch(
          `${
            isMainnet ? MAINNET_ZETA_BLOCKPI : TESTNET_ZETA_BLOCKPI
          }/public/cosmos/bank/v1beta1/balances/${zetaAddr}`,
        );
        zetaData = await zeta.json();
      } catch (error) {
        console.error('Error fetching Zeta balance:', error);
        zetaData = {};
      }

      try {
        const nonZeta = await fetch(
          `${
            isMainnet ? MAINNET_ZETA_BLOCKSCOUT : TESTNET_ZETA_BLOCKSCOUT
          }/addresses/${request.params[0]}/token-balances`,
        );
        nonZetaData = await nonZeta.json();
      } catch (error) {
        console.error('Error fetching non-Zeta balance:', error);
        nonZetaData = {};
      }

      try {
        const currentBtcPriceResponse = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
        );
        const btcPriceData = await currentBtcPriceResponse.json();
        btcPrice = btcPriceData.bitcoin.usd;
      } catch (error) {
        console.error('Error fetching BTC price:', error);
        btcPrice = 0;
      }

      try {
        const zetaPriceResponse = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=zetachain&vs_currencies=usd',
        );
        const zetaPriceData = await zetaPriceResponse.json();
        zetaPrice = zetaPriceData.zetachain.usd;
      } catch (error) {
        console.error('Error fetching Zeta price:', error);
        zetaPrice = 0;
      }

      return {
        zeta: zetaData ?? {},
        nonZeta: nonZetaData ?? {},
        zetaPrice,
        btcPrice,
      };
    }
    throw new Error('Some parameters are missing.');
  } catch (error) {
    console.error('Error getting Zeta balance:', error);
    throw new Error('Failed to retrieve Zeta balance.' + error);
  }
};
