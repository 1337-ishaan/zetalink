/**
 * Converts sats to btc.
 *
 * @param sats - The amount in sats to convert.
 * @returns The amount in btc.
 */
export const satsToBtc = (sats: number): number => {
  return sats / 100000000;
};

/**
 * Converts btc to sats.
 *
 * @param btc - The amount in btc to convert.
 * @returns The amount in sats.
 */
export const btcToSats = (btc: number): number => {
  return btc * 100000000;
};
