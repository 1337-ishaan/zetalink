import React, { useContext, useState, useEffect } from 'react';
import styled from 'styled-components';

import TrxRow from './TrxRow';
import { ReactComponent as RefreshIcon } from '../../assets/refresh.svg';
import { StoreContext } from '../../hooks/useStore';
import { getBtcTrxs, getBtcUtxo } from '../../utils';
import Arrow from '../utils/Arrow';
import Loader from '../utils/Loader';
import TooltipInfo from '../utils/TooltipInfo';
import Typography from '../utils/Typography';
import FlexColumnWrapper from '../utils/wrappers/FlexColumnWrapper';
import FlexRowWrapper from '../utils/wrappers/FlexRowWrapper';

const TrxHistoryWrapper = styled.div`
  background: ${(props) => props.theme.colors.dark?.default};
  box-shadow: 0px 0px 21px 5px rgba(0, 0, 0, 1);
  color: #dadada;
  padding: 24px;
  transition: all 0.4s;
  z-index: 0;
  overflow-x: hidden;
  border-radius: ${(props) => props.theme.borderRadius};
  height: 360px;
  &::-webkit-scrollbar {
    display: none; /* For Chrome, Safari, and Opera */
  }
  .trx-row-wrapper {
    width: auto;
    overflow-y: auto;
    scrollbar-width: none; /* For Firefox */
    -ms-overflow-style: none; /* For Internet Explorer and Edge */
    &::-webkit-scrollbar {
      display: none; /* For Chrome, Safari, and Opera */
    }
  }
  .no-transactions {
    display: flex;
    height: 350px;
    justify-content: center;
  }

  a {
    color: white;
  }

  .accordion__button {
    background-color: transparent !important;
    color: white;
    display: flex;
    width: fit-content;
    align-items: center;
  }

  .accordion {
    border: none;
  }

  .flex-row {
    justify-content: space-between;
  }

  .refresh-icon {
    cursor: pointer;
  }

  .filter-trx-type {
    justify-content: flex-end;
    align-items: center;
    padding: 4px 0;
    column-gap: 8px;

    .t-filter {
      transition: all 0.3s;

      &:hover {
        transition: all 0.3s;
        box-shadow: 0px 0px 21px 5px rgba(0, 0, 0, 0.5);
      }
      z-index: 4;
      cursor: pointer;

      &.active {
        background: #d5d5d5;
      }
    }
  }
  .sticky {
    position: sticky;
    padding: 0px 4px;
    top: 0;
    width: auto;
    backdrop-filter: blur(12px);
    border-radius: 12px;
  }
`;

const TrxHistory: React.FC = () => {
  const { globalState, setGlobalState } = useContext(StoreContext);
  const [isRefetched, setIsRefetched] = useState(false);
  const [filter, setFilter] = useState<'SENT' | 'RECEIVED' | ''>('');
  const [tipHeight, setTipHeight] = useState<number>(0);

  useEffect(() => {
    if (
      (Boolean(globalState?.btcAddress) &&
        !globalState?.btcTrxs &&
        !globalState?.utxo) ||
      isRefetched ||
      globalState.isTrxProcessed
    ) {
      const getBtcTrx = async () => {
        try {
          const results: any = await getBtcTrxs();
          const utxo: any = await getBtcUtxo();

          const endpoint = globalState?.isMainnet
            ? 'https://mempool.space/api'
            : 'https://mempool.space/testnet4/api';
          const tipRes = await fetch(`${endpoint}/blocks/tip/height`);
          const fetchedTipHeight = parseInt(await tipRes.text(), 10);
          setTipHeight(fetchedTipHeight);

          setGlobalState({
            ...globalState,
            btcTrxs: results,
            utxo, // results?.final_balance - results?.unconfirmed_balance,
          });
        } catch (error) {
          console.error(error);
        } finally {
          setIsRefetched(false);
        }
      };
      getBtcTrx();
    }
  }, [
    globalState?.btcAddress,
    globalState?.utxo,
    isRefetched,
    globalState?.isTrxProcessed,
    globalState?.isMainnet,
    setGlobalState,
  ]);

  const getAmount = (trx: any) => {
    return trx?.vout?.find(
      (t: any) =>
        t.scriptpubkey_address ===
          'tb1qy9pqmk2pd9sv63g27jt8r657wy0d9ueeh0nqur' ||
        t.scriptpubkey_address === globalState?.btcAddress,
    )?.value;
  };

  return (
    <TrxHistoryWrapper>
      <FlexRowWrapper className="sticky flex-row">
        <Typography>
          Transactions
          <TooltipInfo>
            <Typography size={14} weight={500}>
              Track your BTC transactions here ↓
            </Typography>
          </TooltipInfo>
        </Typography>

        <FlexRowWrapper className="filter-trx-type">
          <Arrow
            className={`t-filter ${filter === 'SENT' && 'active'}`}
            onClick={() =>
              filter !== 'SENT' ? setFilter('SENT') : setFilter('')
            }
          />
          <Arrow
            className={`t-filter ${filter === 'RECEIVED' && 'active'}`}
            isReceived={true}
            onClick={() =>
              filter !== 'RECEIVED' ? setFilter('RECEIVED') : setFilter('')
            }
          />
          <RefreshIcon
            className="refresh-icon"
            onClick={() => setIsRefetched(true)}
          />
        </FlexRowWrapper>
      </FlexRowWrapper>

      {globalState?.btcTrxs?.length <= 0 && (
        <div className="no-transactions">
          <Typography size={22} weight={500}>
            No transactions found 📭
          </Typography>
        </div>
      )}
      {isRefetched ? (
        <Loader />
      ) : (
        globalState?.btcTrxs?.map((trx: any, index: number) => {
          const isSent = trx.vout.some((vout: any) =>
            vout.scriptpubkey_address === globalState?.isMainnet
              ? 'bc1qm24wp577nk8aacckv8np465z3dvmu7ry45el6y'
              : 'tb1qy9pqmk2pd9sv63g27jt8r657wy0d9ueeh0nqur',
          );

          const shouldRender =
            filter === '' ? true : filter === 'SENT' ? isSent : !isSent;

          return (
            shouldRender && (
              <FlexColumnWrapper className="trx-row-wrapper" key={index}>
                {index < 25 && (
                  <TrxRow
                    trx={trx}
                    isSent={isSent}
                    amount={getAmount(trx)}
                    tipHeight={tipHeight}
                  />
                )}
              </FlexColumnWrapper>
            )
          );
        })
      )}
    </TrxHistoryWrapper>
  );
};

export default TrxHistory;
