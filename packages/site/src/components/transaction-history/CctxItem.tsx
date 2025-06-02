import React, { useState } from 'react';
import styled from 'styled-components/macro';

import { ReactComponent as RedirectIcon } from '../../assets/redirect.svg';
import { ReactComponent as RightArrow } from '../../assets/right-arrow.svg';
import { getChainIcon } from '../../constants/getChainIcon';
import { satsToBtc } from '../../utils/satConverter';
import { trimHexAddress } from '../../utils/trimHexAddr';
import InfoBox from '../utils/InfoBox';
import Typography from '../utils/Typography';
import FlexColumnWrapper from '../utils/wrappers/FlexColumnWrapper';
import FlexRowWrapper from '../utils/wrappers/FlexRowWrapper';

// Styled component for the CctxItem
const CctxItemWrapper = styled(FlexColumnWrapper)`
  background: rgba(0, 0, 0, 0.1);
  row-gap: 8px;
  padding: 24px;
  border-radius: 12px;
  // width: 100%;
  // max-width: 40em;
  height: fit-content;
  a {
    color: #eee;
    font-size: 16px;
  }

  .flex-row {
    row-gap: 12px;
  }

  .chain-swap {
    margin: 16px 0;
    column-gap: 16px;
    justify-content: start;

    .chain-logo {
      height: 48px;
    }
  }

  .arrow-icon {
    width: 48px;
  }

  .redirect-icon {
    width: 16px;
    height: 16px;
  }
`;

// Define the structure of the CctxItemProps interface
type InboundTxParams = {
  sender_chain_id: number;
  amount: number;
  tx_finalization_status: string;
};

type OutboundTxParams = {
  receiver_chainId: number;
  receiver: string;
};

type Cctx = {
  index: string;
  cctx_status: {
    status_message: string;
    lastUpdate_timestamp: string;
  };
  inbound_params: InboundTxParams;
  outbound_params: OutboundTxParams[];
};

type CctxItemProps = {
  cctx: any | Cctx;
};

// CctxItem component definition
const CctxItem: React.FC<CctxItemProps> = ({ cctx }) => {
  // State for toggling detailed information
  const [showDetails, setShowDetails] = useState(false);

  // Error handling: Check if cctx is valid
  // if (!cctx || !cctx.inbound_params || !cctx.outbound_params.length) {
  //   return <Typography color="#ff0000">Invalid transaction data.</Typography>;
  // }

  const { inbound_params, outbound_params, cctx_status, index } = cctx;

  return (
    <CctxItemWrapper>
      <Typography color="#a9a8a8" size={18}>
        ZetaChain CCTX Transaction
      </Typography>
      {inbound_params?.sender_chain_id != null &&
        outbound_params?.[0]?.receiver_chainId != null && (
          <FlexRowWrapper className="chain-swap">
            <img
              className="chain-logo"
              // @ts-ignore
              src={getChainIcon(Number(inbound_params.sender_chain_id))}
              alt=""
            />
            <RightArrow className="arrow-icon" />
            <img
              className="chain-logo"
              // @ts-ignore
              src={getChainIcon(Number(outbound_params[0].receiver_chainId))}
              alt=""
            />
          </FlexRowWrapper>
        )}
      <FlexRowWrapper className="flex-row">
        <Typography size={16}>
          Trx Hash:{' '}
          <a
            href={`https://athens.explorer.zetachain.com/cc/tx/${index}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {trimHexAddress(cctx?.index)}
            <RedirectIcon className="redirect-icon" />
          </a>
        </Typography>
      </FlexRowWrapper>
      <Typography size={14}>
        Amount after fees:&nbsp;
        {parseFloat(satsToBtc(inbound_params?.amount).toFixed(8))} tBTC
      </Typography>
      <Typography size={14}>
        Created at:{' '}
        {new Date(
          cctx_status?.lastUpdate_timestamp * 1000,
        ).toLocaleString('en-GB', { timeZone: 'UTC' })}
      </Typography>
      <FlexRowWrapper className="flex-row">
        <Typography size={14} color="#bed837">
          CCTX Status: {cctx_status?.status_message}
        </Typography>
      </FlexRowWrapper>
      <InfoBox>
        All transactions are processed through ZetaChain, including the cross
        chain transaction. The receiver will always be ZetaChain. For more
        details, visit ZetaScan (Trx Hash).
      </InfoBox>
      <Typography
        size={14}
        color="#a9a8a8"
        weight={400}
        onClick={() => setShowDetails((prev) => !prev)}
      >
        {showDetails ? 'Hide Details' : 'Show Details'}
      </Typography>
      {showDetails && inbound_params && (
        <FlexColumnWrapper style={{ rowGap: '4px', marginTop: '8px' }}>
          {cctx.creator && (
            <Typography size={12} color="#ddd">
              <strong>Creator:</strong> {cctx.creator}
            </Typography>
          )}
          {cctx.zeta_fees && (
            <Typography size={12} color="#ddd">
              <strong>Zeta Fees:</strong> {cctx.zeta_fees}
            </Typography>
          )}
          {cctx.relayed_message && (
            <Typography size={12} color="#ddd">
              <strong>Relayed Message:</strong> {cctx.relayed_message}
            </Typography>
          )}
          {cctx_status.status && (
            <Typography size={12} color="#ddd">
              <strong>CCTX Status:</strong> {cctx_status.status}
            </Typography>
          )}
          {cctx_status.status_message != null && (
            <Typography size={12} color="#ddd">
              <strong>Status Message:</strong>{' '}
              {cctx_status.status_message || 'N/A'}
            </Typography>
          )}
          {cctx_status.error_message != null && (
            <Typography size={12} color="#ddd">
              <strong>Error Message:</strong>{' '}
              {cctx_status.error_message || 'N/A'}
            </Typography>
          )}
          {cctx_status.created_timestamp && (
            <Typography size={12} color="#ddd">
              <strong>Created At:</strong>{' '}
              {new Date(
                cctx_status.created_timestamp * 1000,
              ).toLocaleString('en-GB', { timeZone: 'UTC' })}
            </Typography>
          )}
          {cctx_status.lastUpdate_timestamp && (
            <Typography size={12} color="#ddd">
              <strong>Last Updated:</strong>{' '}
              {new Date(
                cctx_status.lastUpdate_timestamp * 1000,
              ).toLocaleString('en-GB', { timeZone: 'UTC' })}
            </Typography>
          )}
          {inbound_params?.sender && (
            <Typography size={12} color="#ddd">
              <strong>Inbound Sender:</strong> {inbound_params.sender}
            </Typography>
          )}
          {inbound_params?.sender_chain_id != null && (
            <Typography size={12} color="#ddd">
              <strong>Inbound Chain ID:</strong>{' '}
              {inbound_params.sender_chain_id}
            </Typography>
          )}
          {inbound_params?.amount != null && (
            <Typography size={12} color="#ddd">
              <strong>Inbound Amount:</strong> {inbound_params.amount}
            </Typography>
          )}
          {inbound_params?.tx_finalization_status && (
            <Typography size={12} color="#ddd">
              <strong>Inbound Status:</strong>{' '}
              {inbound_params.tx_finalization_status}
            </Typography>
          )}
          {outbound_params?.[0]?.receiver && (
            <Typography size={12} color="#ddd">
              <strong>Receiver:</strong> {outbound_params[0].receiver}
            </Typography>
          )}
          {outbound_params?.[0]?.receiver_chainId != null && (
            <Typography size={12} color="#ddd">
              <strong>Receiver Chain ID:</strong>{' '}
              {outbound_params[0].receiver_chainId}
            </Typography>
          )}
          {outbound_params?.[0]?.hash && (
            <Typography size={12} color="#ddd">
              <strong>Outbound Tx Hash:</strong> {outbound_params[0].hash}
            </Typography>
          )}
          {outbound_params?.[0]?.tx_finalization_status && (
            <Typography size={12} color="#ddd">
              <strong>Outbound Status:</strong>{' '}
              {outbound_params[0].tx_finalization_status}
            </Typography>
          )}
        </FlexColumnWrapper>
      )}
    </CctxItemWrapper>
  );
};

export default CctxItem;
