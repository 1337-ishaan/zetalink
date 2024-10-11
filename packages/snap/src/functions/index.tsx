import { bech32 } from 'bech32';
import * as bitcoin from 'bitcoinjs-lib';
import {
  TESTNET_BLOCKCYPHER_API,
  MAINNET_BLOCKCYPHER_API,
  TESTNET_BLOCKSTREAM_API,
  MAINNET_BLOCKSTREAM_API,
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
  OMNICHAIN_SWAP_CONTRACT_ADDRESS,
  ACTION_CODE,
} from '../constants';

import { Box, Link, Heading, Text } from '@metamask/snaps-sdk/jsx';
import { btcToSats, satsToBtc } from './utils/satConverter';

let isMainnet = false;
/**
 * Converts an Ethereum address to a Zeta address and vice versa.
 * @param address - The Ethereum or Zeta address to convert.
 * @returns The converted address in Zeta format or Ethereum format.
 */
const convertToZeta = (address: string): string => {
  try {
    if (address.startsWith('0x')) {
      const data = Buffer.from(trimHexPrefix(address), 'hex');
      return bech32.encode('zeta', bech32.toWords(data));
    } else {
      const decoded = bech32.decode(address);
      return (
        '0x' + Buffer.from(bech32.fromWords(decoded.words)).toString('hex')
      );
    }
  } catch (error) {
    console.error('Error converting EVM address to Zeta:', error);
    throw new Error('Conversion to Zeta failed.');
  }
};

/**
 * Trims the '0x' prefix from a hex string if it exists.
 * @param key - The hex string to trim.
 * @returns The trimmed hex string.
 */
export const trimHexPrefix = (key: string): string => {
  return key.startsWith('0x') ? key.substring(2) : key;
};

/**
 * Creates a Bitcoin testnet address from the BIP32 public key.
 * @returns The generated Bitcoin testnet address.
 */
export const deriveBtcWallet = async (request: any): Promise<string> => {
  isMainnet = request.params[0]!;

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
    } else {
      throw new Error('Failed to create Bitcoin testnet address.');
    }
  } catch (error) {
    console.error('Error creating Bitcoin testnet address:', error);
    throw new Error('Failed to create Bitcoin testnet address.');
  }
};

/**
 * Fetches BTC transactions for the connected account.
 * @returns An object containing UTXO data.
 */
export const getBtcTrxs = async () => {
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
        `${isMainnet ? MAINNET_MEMPOOL : TESTNET_MEMPOOL}/address/${btcAddress}/txs`,
      );

      const utxoData = await utxo.json();

      return utxoData ?? [];
    } else {
      throw new Error('Failed to create Bitcoin testnet address.');
    }
  } catch (error) {
    console.error('Error getting BTC UTXOs:', error);
    throw new Error('Failed to retrieve Bitcoin UTXOs.');
  }
};

/**
 * Retrieves current Bitcoin transaction depositFees.
 * @returns An object containing depositFee data.
 */
export const getFees = async () => {
  try {
    const utxo = await fetch(
      `${isMainnet ? MAINNET_MEMPOOL : TESTNET_MEMPOOL}/v1/fees/recommended`,
      // `${isMainnet ? MAINNET_BLOCKCYPHER_API : TESTNET_BLOCKCYPHER_API}`,
    );
    if (!utxo.ok) {
      throw new Error('Failed to fetch depositFees.');
    }
    const utxoData = await utxo.json();
    return {
      btcFees: utxoData.fastestFee * 2.4,
      zetaDepositFees: utxoData.fastestFee * 68 * 2,
    }; // zetachain's deposit fee = (high_fee_per_kb * 0.001)sat/vB * 68 sat/vB * 2
  } catch (error) {
    console.error('Error getting depositFees:', error);
    throw new Error('Failed to retrieve depositFees.');
  }
};

/**
 * Broadcasts a Bitcoin transaction to the network.
 * @param hex - The transaction hex string to broadcast.
 * @returns The transaction ID after broadcasting.
 */
const broadcastTransaction = async (hex: string) => {
  try {
    const response: Response = await fetch(
      `${isMainnet ? MAINNET_MEMPOOL : TESTNET_MEMPOOL}/tx`,
      {
        method: 'POST',
        body: hex,
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
              href={`${isMainnet ? MAINNET_MEMPOOL : TESTNET_MEMPOOL}/tx/${txData}`}
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
 * @param None.
 * @returns The UTXO data.
 */
export const fetchUtxo = async () => {
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
        `${isMainnet ? MAINNET_MEMPOOL : TESTNET_MEMPOOL}/address/${btcAddress}/utxo`,
      );

      const utxoData = await utxo.json();
      return utxoData;
    }
  } catch (error) {
    console.error('Error fetching UTXO:', error);
    throw new Error('Failed to fetch UTXO.');
  }
};

/**
 * Executes a cross-chain swap transaction for Bitcoin.
 * @param request - The request object containing transaction parameters.
 * @returns The transaction ID after broadcasting.
 */

export const transactBtc = async (request: any) => {
  if (!request || !request.params) {
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
          <Text>Transfer Amount - {'' + transferAmountRaw} BTC</Text>
          <Text>ZRC20 Contract Address - {'' + ZRC20ContractAddress}</Text>
          <Text>Recipient Address - {'' + recipientAddress}</Text>
          <Text>Deposit Fees - {'' + depositFeeRaw} BTC</Text>
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
    const depositFee: { zetaDepositFees: number; btcFees: number } =
      await getFees();

    await snap.request({
      method: 'snap_dialog',
      params: {
        type: 'alert',
        content: (
          <Box>
            <Heading>{JSON.stringify(depositFee)}</Heading>
          </Box>
        ),
      },
    });

    const transferAmount =
      Math.floor(btcToSats(parseFloat(transferAmountRaw))) - 1; // subtracting 1 to account for depositFees

    let generatedMemo;

    try {
      const slip10Node = await snap.request({
        method: 'snap_getBip32Entropy',
        params: {
          path: DERIVATION_PATH,
          curve: CRYPTO_CURVE,
        },
      });

      if (!slip10Node || !slip10Node.publicKey || !slip10Node.privateKey) {
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

        let trimmedSanitizedRecipientAddress = trimHexPrefix(recipientAddress);
        let trimmedSanitizedZRC20ContractAddress =
          trimHexPrefix(ZRC20ContractAddress);
        let trimmedOmnichainContract = trimHexPrefix(
          OMNICHAIN_SWAP_CONTRACT_ADDRESS,
        );

        if (!!ZRC20ContractAddress) {
          generatedMemo = `${trimmedOmnichainContract}${ACTION_CODE}${trimmedSanitizedZRC20ContractAddress}${trimmedSanitizedRecipientAddress}`;
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
        customMemo && !!ZRC20ContractAddress ? customMemo : generatedMemo,
        'hex',
      );

      if (memoBuffer.length >= 78) throw new Error('Memo too long');

      utxos.sort(
        (a: { value: number }, b: { value: number }) => a.value - b.value,
      );

      if (typeof depositFee?.zetaDepositFees !== 'number') {
        throw new Error('Invalid deposit fee type');
      }

      const total = Math.floor(
        transferAmount + depositFee.zetaDepositFees! + depositFee.btcFees,
      );

      let sum = 0;
      const pickUtxos = [];

      for (const utxo of utxos) {
        sum += utxo.value;
        pickUtxos.push(utxo);
        if (sum >= total) break;
      }

      if (sum < total) throw new Error('Not enough funds');

      const change = sum - total;
      const txs = [];

      for (const utxo of pickUtxos) {
        const p1 = await fetch(
          `${isMainnet ? MAINNET_BLOCKSTREAM_API : TESTNET_BLOCKSTREAM_API}/tx/${utxo.txid}`,
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

      psbt.addOutput({
        address: isMainnet ? MAINNET_ZETA_TSS : TESTNET_ZETA_TSS,
        value: transferAmount + depositFee.zetaDepositFees,
      });

      if (memoBuffer.length > 0) {
        const embed = bitcoin.payments.embed({
          data: [memoBuffer],
        });
        if (!embed.output) throw new Error('Unable to embed memo');
        psbt.addOutput({ script: embed.output, value: 0 });
      }

      if (change > 0) {
        psbt.addOutput({ address: btcAddress, value: change });
      }

      for (let i = 0; i < pickUtxos.length; i++) {
        const utxo = pickUtxos[i];
        const tx = txs[i];
        if (!tx || !tx.vout || !tx.vout[utxo.vout]) {
          throw new Error(`Invalid transaction data for UTXO ${utxo.txid}`);
        }

        const inputData = {
          hash: tx.txid,
          index: utxo.vout,
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
 * Tracks a cross-chain transaction by its hash.
 * @param request - The request object containing the transaction hash.
 * @returns The transaction data.
 */

export const trackCctxTx = async (request: any) => {
  try {
    const cctxIndex = await fetch(
      `${isMainnet ? MAINNET_ZETA_BLOCKPI : TESTNET_ZETA_BLOCKPI}/afa7758ad026d7ae54ff629af5883f53bdd82d73/zeta-chain/crosschain/inTxHashToCctx/${request.params[0]}`,
    );
    const cctxIndexData = await cctxIndex.json();
    let cctx = cctxIndexData;
    const cctxInfo = await fetch(
      `${isMainnet ? MAINNET_ZETA_BLOCKPI : TESTNET_ZETA_BLOCKPI}/afa7758ad026d7ae54ff629af5883f53bdd82d73/zeta-chain/crosschain/cctx/${cctx.inboundHashToCctx.cctx_index[0]}`,
    );

    const cctxInfoData = await cctxInfo.json();
    return cctxInfoData;
  } catch (error) {
    console.error('Error tracking cross-chain transaction:', error);
    throw new Error('Failed to track cross-chain transaction.');
  }
};

/**
 * Retrieves the balance for a given EVM address and exchange_rate.
 * @param request - The request object containing the EVM address.
 * @returns An object containing Zeta, non-Zeta balances and prices.
 */
export const getBalanceAndRate = async (request: any) => {
  try {
    if (request.params[0]) {
      const evmAddress = convertToZeta(request.params[0]);

      const zeta = await fetch(
        `${isMainnet ? MAINNET_ZETA_BLOCKPI : TESTNET_ZETA_BLOCKPI}/public/cosmos/bank/v1beta1/spendable_balances/${evmAddress}`,
      );
      const nonZeta = await fetch(
        `${isMainnet ? MAINNET_ZETA_BLOCKSCOUT : TESTNET_ZETA_BLOCKSCOUT}/addresses/${request.params[0]}/token-balances`,
      );

      const currentBtcPriceResponse = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
      );
      const btcPriceData = await currentBtcPriceResponse.json();
      const btcPrice = btcPriceData.bitcoin.usd;

      const zetaPriceResponse = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=zetachain&vs_currencies=usd',
      );
      const zetaPriceData = await zetaPriceResponse.json();

      const zetaPrice = zetaPriceData.zetachain.usd;

      const zetaData = await zeta.json();
      const nonZetaData = await nonZeta.json();

      return {
        zeta: zetaData,
        nonZeta: nonZetaData,
        zetaPrice,
        btcPrice,
      };
    } else {
      throw new Error('Some parameters are missing.');
    }
  } catch (error) {
    console.error('Error getting Zeta balance:', error);
    throw new Error('Failed to retrieve Zeta balance.');
  }
};
