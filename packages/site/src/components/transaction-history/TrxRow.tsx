import { useEffect, useState } from 'react';
import styled from 'styled-components/macro';

import CCTXModal from './CCTXModal';
import { ReactComponent as RedirectIcon } from '../../assets/redirect.svg';
import { trackCctx } from '../../utils';
import { trimHexAddress } from '../../utils/trimHexAddr';
import Arrow from '../utils/Arrow';
import Typography from '../utils/Typography';
import FlexColumnWrapper from '../utils/wrappers/FlexColumnWrapper';
import FlexRowWrapper from '../utils/wrappers/FlexRowWrapper';
import { useStore } from '../../hooks/useStore';

const TrxRowWrapper = styled(FlexRowWrapper)<{ isSent: boolean }>`
  align-items: center;
  // column-gap: 48px;
  justify-content: space-around;
  width:100%;
  padding:16px 0px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  .redirect-icon {
    width: 16px;
    height: 16px;
  }
  .info-column{
    row-gap: 4px;
  }
  .amount-status-wrapper {
    margin-left: auto;
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    // width: 100%;
  }

  .status-pill {
    background: rgba(13, 73, 15, 0.6);
    border-radius: 12px;
    white-space:nowrap;
    padding: 4px 8px;
    box-shadow: 0px 0px 10px 5px rgba(0, 0, 0, 1);
  }

  .trx-hash{
      white-space: nowrap;
    }
  } 
  .t-trx-amount{
    white-space:nowrap;
  }
    transition: transform 0.3s ease-in-out;

  &:hover {
    cursor: ${(props) => (props.isSent ? 'pointer' : 'default')};
    transition: transform 0.3s ease-in-out;
    box-shadow: 0px 0px 10px 5px rgba(0, 0, 0, 0.1);
    background: rgba(255,255,255,0.05);
  }
`;

type Trx = {
  hash: string;
  confirmations: number;
};

type TrxRowProps = {
  trx: any;
  isSent: boolean;
  amount: number;
  tipHeight: number; // current block height for calculating confirmations
};

const TrxRow: React.FC<TrxRowProps> = ({ trx, isSent, amount, tipHeight }) => {
  const { globalState } = useStore();
  const [isCctxModalOpen, setIsCctxModalOpen] = useState(false);
  const [cctx, setCctx] = useState<any>({});
  const [isCctxClicked, setIsCctxClicked] = useState(false);
  const [cctxError, setCctxError] = useState('');

  // Calculate confirmations: if confirmed, compute difference; otherwise zero
  const confirmations = trx?.status?.block_height
    ? tipHeight - trx.status.block_height + 1
    : 0;

  const onCloseCctx = (isOpen: boolean) => {
    setCctx({});
    setIsCctxModalOpen(isOpen);
  };
  const onTrackCctx = async (trxHash: string) => {
    setIsCctxModalOpen(true);
    console.log(trxHash, 'trxHash');

    try {
      const cctxData: any = await trackCctx(trxHash);
      console.log(cctxData, 'cctxData');
      if (cctxData) {
        setCctx(cctxData?.CrossChainTxs[0]);
        setIsCctxModalOpen(true);
      }
    } catch (error) {
      const errMsg = (error as any)?.message ?? String(error);
      setCctxError(errMsg);
      console.error('Error tracking cross-chain transaction:', error);
    }
  };
  console.log(cctx, 'cctx');
  return (
    <>
      <TrxRowWrapper
        isSent={isSent}
        aria-disabled={isCctxClicked}
        onClick={async () => onTrackCctx(trx.txid)}
      >
        <FlexRowWrapper className="trx-hash-wrapper">
          <Arrow isReceived={!isSent} />
          <FlexColumnWrapper className="info-column type-hash-wrapper">
            <Typography size={16} color={isSent ? '#ff4a3d' : '#008462'}>
              {isSent ? 'Sent' : 'Received'}
            </Typography>
            <Typography size={14} className="trx-hash">
              BTC trx:
              <a
                href={`https://mempool.space/${
                  globalState?.isMainnet ? '' : 'testnet4/'
                }tx/${trx.txid}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {trimHexAddress(trx.txid)}
                <RedirectIcon className="redirect-icon" />
              </a>
            </Typography>
          </FlexColumnWrapper>
        </FlexRowWrapper>

        <FlexColumnWrapper className="info-column amount-status-wrapper">
          <Typography
            className="t-trx-amount"
            size={14}
            color={!isSent ? '#008462' : '#ff4a3d'}
          >
            {isSent ? '-' : '+'}
            {isNaN(amount / 1e8)
              ? '0'
              : parseFloat((amount / 1e8).toFixed(8)).toString()}{' '}
            BTC
          </Typography>
          <Typography
            size={12}
            className="status-pill"
            color={trx?.status?.confirmed ? '#ffffff' : 'yellow'}
          >
            {confirmations} confirmation{confirmations !== 1 ? 's' : ''}
          </Typography>
        </FlexColumnWrapper>
      </TrxRowWrapper>
      {isSent && isCctxModalOpen ? (
        <CCTXModal
          cctx={cctx}
          isCCTXModalOpen={isCctxModalOpen}
          setIsCCTXModalOpen={onCloseCctx}
          cctxError={cctxError}
        />
      ) : null}
    </>
  );
};

export default TrxRow;
