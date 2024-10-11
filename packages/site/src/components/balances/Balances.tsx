import styled from 'styled-components/macro';
import { useContext, useEffect, useState } from 'react';
import { StoreContext } from '../../hooks/useStore';
import { getBalanceAndRate } from '../../utils';
import DOMPurify from 'dompurify';
import { ReactComponent as BtcIcon } from '../../assets/bitcoin.svg';
import { ReactComponent as ZetaIcon } from '../../assets/zetachain.svg';
import Typography from '../utils/Typography';
import TooltipInfo from '../utils/TooltipInfo';
import FlexColumnWrapper from '../utils/wrappers/FlexColumnWrapper';
import BalancePie from './charts/BalancePie';
import BigNumber from 'bignumber.js';
import EmptyBalance from './EmptyBalance';
import { satsToBtc } from '../../utils/satConverter';

interface BalanceData {
  label: string;
  value: number;
  usdPrice?: number | null;
  icon_url?: string | null;
}

interface NonZetaToken {
  token: {
    symbol: string;
    exchange_rate: number | null;
    icon_url: string | null;
  };
  value: number;
}

interface ZetaBalance {
  denom: string;
  amount: number;
}

interface ZetaBalanceResponse {
  nonZeta: NonZetaToken[] | { message?: string };
  zeta: {
    balances: ZetaBalance[];
  };
  zetaPrice: number;
  btcPrice: number;
}

const BalancesWrapper = styled(FlexColumnWrapper)`
  padding: 32px;
  background: ${(props) => props.theme.colors.dark?.default};
  box-shadow: 0px 0px 21px 5px rgba(0, 0, 0, 1);
  border-radius: ${(props) => props.theme.borderRadius};
  width: 50%;
  width: 500px;

  .input-container {
    position: relative;
    display: inline-block;

    .searched-input {
      outline: none;
      padding: 12px;
      border-radius: 12px;
      border: none;
      background: rgba(12, 12, 12, 0.8);
      color: #fff;
      width: 40%;
      font-size: 16px;
      margin-top: 24px;
    }
  }

  table {
    border: 3px solid #ddd;
    border-collapse: collapse;

    th,
    td {
      padding: 4px 8px;
      color: #eee;
      border: 1px solid #ddd;
      text-align: left;
    }

    th {
      color: #a5a8a5;
      text-transform: uppercase;
    }
  }

  .error-message {
    color: #eee;
    margin-top: 16px;
  }
  .balance-pie-container {
    width: 100%;
    height: 100%;
    justify-content: space-between;
  }
`;

interface BalancesProps {}

const Balances = ({}: BalancesProps): JSX.Element => {
  const { globalState } = useContext(StoreContext);
  const [data, setData] = useState<BalanceData[]>([]);
  const [searched, setSearched] = useState<BalanceData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const isMainnet = globalState.isMainnet;

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
          console.log(result, 'result balance');

          const maps: BalanceData[] = Array.isArray(result.nonZeta)
            ? result.nonZeta.map((t) => ({
                label: t.token.symbol,
                usdPrice:
                  new BigNumber(t?.value)
                    .dividedBy(t?.token?.symbol === 'tBTC' ? 1e8 : 1e18)
                    .toNumber() * +t.token.exchange_rate! ?? 0,
                icon_url: t.token.icon_url ?? '',
                value: new BigNumber(t?.value)
                  .dividedBy(t?.token?.symbol === 'tBTC' ? 1e8 : 1e18)
                  .toNumber(),
              }))
            : [];

          if (
            Array.isArray(result.nonZeta) &&
            result.zeta.balances.length === 0 &&
            result.nonZeta.length === 0
          ) {
            setData([
              {
                label: 'BTC',
                value: 0,
              },
              {
                label: 'ZETA',
                value: 0,
              },
            ]);
          } else {
            setData([
              {
                label: 'BTC',
                value: satsToBtc(globalState.utxo),
                usdPrice: satsToBtc(globalState.utxo) * result.btcPrice,
              },
              ...maps,
              {
                label: result?.zeta?.balances[0]?.denom
                  ? result.zeta.balances[0]?.denom!
                  : 'ZETA',
                value: result?.zeta?.balances[0]?.amount
                  ? result.zeta.balances[0]?.amount! / 1e18
                  : 0,
                usdPrice:
                  (result.zeta.balances[0]?.amount! / 1e18) * result.zetaPrice,
              },
            ]);
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

  console.log(data, 'data');

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
  console.log(data, 'data');
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
                "Error loading balances, {error + ''}
              </div>
            )}
            <BalancePie data={data} />
            <table>
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Amount</th>
                  <th>Amount ($)</th>
                </tr>
              </thead>
              <tbody>
                {(searched.length > 0 ? searched : data).map((item, index) => (
                  <tr key={index}>
                    <td>
                      <Typography size={14}>
                        {item.label === 'BTC' ? (
                          <BtcIcon className="chain-icon" />
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
                      {!globalState.isMainnet
                        ? 0
                        : parseFloat(item.usdPrice!.toString()).toLocaleString(
                            undefined,
                            {
                              minimumSignificantDigits: 1,
                              maximumSignificantDigits: 8,
                            },
                          )}
                    </td>
                  </tr>
                ))}
              </tbody>
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
