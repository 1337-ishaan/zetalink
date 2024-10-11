import React, { useContext, useState, useEffect } from 'react';
import { getBtcTrxs, getBtcUtxo } from '../../utils';
import styled from 'styled-components';
import Typography from '../utils/Typography';
import TrxRow from './TrxRow';
import { ReactComponent as RefreshIcon } from '../../assets/refresh.svg';
import Loader from '../utils/Loader';
import FlexRowWrapper from '../utils/wrappers/FlexRowWrapper';
import TooltipInfo from '../utils/TooltipInfo';
import { StoreContext } from '../../hooks/useStore';
import Arrow from '../utils/Arrow';
import FlexColumnWrapper from '../utils/wrappers/FlexColumnWrapper';

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

  useEffect(() => {
    if (
      (!!globalState?.btcAddress &&
        !globalState?.btcTrxs &&
        !globalState?.utxo) ||
      isRefetched ||
      globalState.isTrxProcessed
    ) {
      const getBtcTrx = async () => {
        try {
          const results: any = await getBtcTrxs();
          const utxo: any = await getBtcUtxo();
          console.log(utxo, 'utxo');
          setGlobalState({
            ...globalState,
            btcTrxs: results,
            utxo, //results?.final_balance - results?.unconfirmed_balance,
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

  console.log(globalState?.btcTrxs, 'globalState?.btcTrxs');

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
          const isSent = trx.vout.some(
            (vout: any) =>
              vout.scriptpubkey_address ===
              'tb1qy9pqmk2pd9sv63g27jt8r657wy0d9ueeh0nqur',
          );

          const shouldRender =
            filter === '' ? true : filter === 'SENT' ? isSent : !isSent;

          return (
            shouldRender && (
              <FlexColumnWrapper className="trx-row-wrapper">
                {index < 25 && (
                  <TrxRow
                    key={index}
                    trx={trx}
                    isSent={isSent}
                    amount={getAmount(trx)}
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
