import { trimHexAddress } from '../../utils/trimHexAddr';
import styled from 'styled-components/macro';
import Arrow from '../utils/Arrow';
import { trackCctx } from '../../utils';

import { useEffect, useState } from 'react';
import Typography from '../utils/Typography';
import FlexRowWrapper from '../utils/wrappers/FlexRowWrapper';
import FlexColumnWrapper from '../utils/wrappers/FlexColumnWrapper';
import { ReactComponent as RedirectIcon } from '../../assets/redirect.svg';

import CCTXModal from './CCTXModal';

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

interface Trx {
  hash: string;
  confirmations: number;
}

interface TrxRowProps {
  trx: any;
  isSent: boolean;
  amount: number;
}

const TrxRow: React.FC<TrxRowProps> = ({ trx, isSent, amount }) => {
  const [isCctxModalOpen, setIsCctxModalOpen] = useState(false);
  const [cctx, setCctx] = useState<any>({});
  const [isCctxClicked, setIsCctxClicked] = useState(false);
  const [cctxError, setCctxError] = useState('');

  const onCloseCctx = (isOpen: boolean) => {
    setCctx({});
    setIsCctxModalOpen(isOpen);
  };
  const onTrackCctx = async (trxHash: string) => {
    setIsCctxModalOpen(true);

    try {
      const cctxData: any = await trackCctx(trxHash);

      if (!!cctxData) {
        setCctx(cctxData?.CrossChainTx);
        setIsCctxModalOpen(true);
      }
    } catch (error: any) {
      setCctxError(error?.message);
      console.error('Error tracking cross-chain transaction:', error);
    }
  };
  return (
    <>
      <TrxRowWrapper
        isSent={isSent}
        aria-disabled={isCctxClicked}
        onClick={() => onTrackCctx(trx.txid)}
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
                href={`https://mempool.space/testnet/tx/${trx.txid}`}
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
            {trx?.status?.confirmed ? 'Confirmed' : `Pending`}
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
