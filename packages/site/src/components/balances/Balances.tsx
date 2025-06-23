import BigNumber from 'bignumber.js';
import DOMPurify from 'dompurify';
import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import { JsonRpcProvider, formatEther } from 'ethers';

import BalancePie from './charts/BalancePie';
import EmptyBalance from './EmptyBalance';
import { ReactComponent as BtcIcon } from '../../assets/bitcoin.svg';
import { ReactComponent as ZetaIcon } from '../../assets/zetachain.svg';
import { StoreContext } from '../../hooks/useStore';
import { getBalanceAndRate } from '../../utils';
import { satsToBtc } from '../../utils/satConverter';
import TooltipInfo from '../utils/TooltipInfo';
import Typography from '../utils/Typography';
import FlexColumnWrapper from '../utils/wrappers/FlexColumnWrapper';
import { EVM_CHAINS } from '../../config/evmChains';
import { getChainIcon } from '../../constants/getChainIcon';

type BalanceData = {
  label: string;
  value: number;
  usdPrice?: number | null;
  icon_url?: string | null;
  chainId?: number;
};

type NonZetaToken = {
  token: {
    symbol: string;
    exchange_rate: number | null;
    icon_url: string | null;
  };
  value: number;
};

type ZetaBalance = {
  denom: string;
  amount: number;
};

type ZetaBalanceResponse = {
  nonZeta: NonZetaToken[] | { message?: string };
  zeta: {
    balances: ZetaBalance[];
  };
  zetaPrice: number;
  btcPrice: number;
};

const BalancesWrapper = styled(FlexColumnWrapper)`
  padding: 32px;
  background: ${(props) => props.theme.colors.dark?.default};
  box-shadow: 0px 0px 21px 5px rgba(0, 0, 0, 1);
  border-radius: ${(props) => props.theme.borderRadius};
  width: 500px;
  max-height: 594px;
  overflow-y: hidden;

  .input-container {
    position: relative;
    display: inline-block;
    width: fit-content;

    .searched-input {
      outline: none;
      padding: 12px;
      border-radius: 12px;
      border: none;
      background: rgba(12, 12, 12, 0.8);
      color: #fff;
      width: 100%;
      font-size: 16px;
      margin-top: 24px;
    }
  }

  table {
    width: 100%;
    margin-top: 16px;
    border-collapse: separate;
    border-spacing: 0;
    z-index: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

    thead {
      background: #1a1a1a;
    }

    th {
      padding: 12px 16px;
      color: #bbb;
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 0.05em;
      border-bottom: 1px solid #333;
      position: sticky;
      top: 0;
      z-index: 1;
      text-align: left;
    }

    td {
      padding: 12px 16px;
      color: #eee;
      border-bottom: 1px solid #333;
      text-align: left;
    }

    tbody tr {
      background: #111;
      &:nth-child(even) {
        background: #1a1a1a;
      }
      &:hover {
        background: #222;
      }
    }
  }

  .error-message {
    color: #eee;
    margin-top: 16px;
  }
  .balance-pie-container {
    width: 100%;
    height: 100%;
    overflow: visible;
    justify-content: space-between;
  }
`;

const ScrollableTbody = styled.tbody`
  display: block;
  max-height: 170px; /* Adjust as needed */
  overflow-y: auto;
  width: 100%;
  // padding-bottom: 24px; /* Add bottom padding */
`;

const StyledThead = styled.thead`
  display: table;
  width: 100%;
  table-layout: fixed;
`;

const StyledTr = styled.tr`
  display: table;
  width: 100%;
  table-layout: fixed;
`;

type BalancesProps = {};

const Balances = ({}: BalancesProps): JSX.Element => {
  const { globalState } = useContext(StoreContext);
  const [data, setData] = useState<BalanceData[]>([]);
  const [searched, setSearched] = useState<BalanceData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { isMainnet } = globalState;

  useEffect(() => {
    if (
      globalState?.evmAddress &&
      typeof globalState?.utxo === 'number' &&
      isMainnet === globalState.isMainnet
    ) {
      const fetchBalances = async () => {
        try {
          const result = (await getBalanceAndRate(
            globalState.evmAddress as string,
          )) as ZetaBalanceResponse;

          const maps: BalanceData[] = Array.isArray(result.nonZeta)
            ? result.nonZeta.map((t) => ({
                label: t.token.symbol,
                usdPrice:
                  new BigNumber(t?.value)
                    .dividedBy(t?.token?.symbol === 'tBTC' ? 1e8 : 1e18)
                    .toNumber() * Number(t.token.exchange_rate!),
                icon_url: t.token.icon_url ?? '',
                value: new BigNumber(t?.value)
                  .dividedBy(t?.token?.symbol === 'tBTC' ? 1e8 : 1e18)
                  .toNumber(),
              }))
            : [];

          // Fetch native balances for all supported EVM chains via Infura RPC
          const otherEvmDataRaw: (BalanceData | null)[] = await Promise.all(
            EVM_CHAINS.map(
              async (chain): Promise<BalanceData | null> => {
                const provider = new JsonRpcProvider(chain.rpcUrl);
                const balanceBN = await provider.getBalance(
                  globalState.evmAddress as string,
                );
                const value = parseFloat(formatEther(balanceBN));
                if (value <= 0) {
                  return null;
                }
                const priceRes = await fetch(
                  `https://api.binance.com/api/v3/avgPrice?symbol=${chain.symbol}USDT`,
                );
                const priceData = await priceRes.json();
                return {
                  label: chain.symbol,
                  value,
                  usdPrice: value * priceData.price,
                  icon_url: null,
                  chainId: chain.chainId,
                };
              },
            ),
          );
          const otherEvmData: BalanceData[] = otherEvmDataRaw.filter(
            (b): b is BalanceData => b !== null,
          );

          if (
            Array.isArray(result.nonZeta) &&
            result.zeta.balances.length === 0 &&
            result.nonZeta.length === 0
          ) {
            setData([
              { label: 'BTC', value: 0 },
              { label: 'ZETA', value: 0 },
              ...otherEvmData,
            ]);
          } else {
            const baseData: BalanceData[] = [
              {
                label: 'BTC',
                value: satsToBtc(globalState.utxo),
                usdPrice: satsToBtc(globalState.utxo) * result.btcPrice,
              },
              ...maps,
              {
                label: result?.zeta?.balances[0]?.denom ?? 'ZETA',
                value: result?.zeta?.balances[0]?.amount
                  ? result.zeta.balances[0]?.amount / 1e18
                  : 0,
                usdPrice:
                  (result.zeta.balances[0]?.amount! / 1e18) * result.zetaPrice,
              },
            ];
            setData([...baseData, ...otherEvmData]);
          }
          setError(null);
        } catch (err) {
          setError('Failed to fetch balance data. Please try again later.');
          console.error(err);
        }
      };
      fetchBalances();
    }
  }, [globalState?.evmAddress, globalState?.utxo]);

  const handleSearch = (text: string) => {
    const searchText = DOMPurify.sanitize(text);
    if (data.length > 0 && searchText) {
      const filteredData = data.filter((item) =>
        item.label.toLowerCase().includes(searchText.toLowerCase()),
      );
      setSearched(filteredData);
    } else {
      setSearched(data);
    }
  };

  // console\.log\(.*?\);+?

  return (
    <BalancesWrapper>
      <Typography size={24}>
        Balances
        <TooltipInfo
          children={
            <Typography size={14} weight={500}>
              All assets on the ZetaChain Network and <br />
              Bitcoin Network (BTC) are displayed here ↓
              <br />
              <br />
              {!globalState.isMainnet
                ? 'TESTNET: The pie-chart displays native BTC & ZETA'
                : ''}
            </Typography>
          }
        />
      </Typography>

      <FlexColumnWrapper className="balance-pie-container">
        {data.length > 0 ? (
          <>
            <div className="input-container">
              <input
                placeholder="Search Asset"
                onChange={(e) => handleSearch(e.target.value)}
                className="searched-input"
              />
            </div>
            {error && data.length === 0 && (
              <div className="error-message">
                "Error loading balances, {`${error}`}
              </div>
            )}
            <BalancePie data={data} />
            <table>
              <StyledThead>
                <StyledTr>
                  <th>Asset</th>
                  <th>Amount</th>
                  <th>Amount ($)</th>
                </StyledTr>
              </StyledThead>
              <ScrollableTbody>
                {(searched.length > 0 ? searched : data).map((item, index) => (
                  <StyledTr key={index}>
                    <td>
                      <Typography size={14}>
                        {item.icon_url ? (
                          <img
                            style={{ width: '24px', height: '24px' }}
                            src={item.icon_url}
                            className="chain-icon"
                            alt={item.label}
                          />
                        ) : item.label === 'BTC' ? (
                          <BtcIcon className="chain-icon" />
                        ) : item.chainId ? (
                          <img
                            src={
                              (getChainIcon(item.chainId) as unknown) as string
                            }
                            style={{ width: '24px', height: '24px' }}
                            className="chain-icon"
                            alt={item.label}
                          />
                        ) : (
                          <ZetaIcon className="chain-icon" />
                        )}
                        {item.label}
                      </Typography>
                    </td>
                    <td>
                      <Typography size={14}>
                        {parseFloat(item.value.toString()).toLocaleString(
                          undefined,
                          {
                            minimumSignificantDigits: 1,
                            maximumSignificantDigits: 8,
                          },
                        )}{' '}
                        {item.label}
                      </Typography>
                    </td>
                    <td>
                      {parseFloat(item.usdPrice!.toString()).toLocaleString(
                        undefined,
                        {
                          minimumSignificantDigits: 1,
                          maximumSignificantDigits: 8,
                        },
                      )}
                    </td>
                  </StyledTr>
                ))}
              </ScrollableTbody>
            </table>
          </>
        ) : (
          <EmptyBalance />
        )}
      </FlexColumnWrapper>
    </BalancesWrapper>
  );
};

export default Balances;
