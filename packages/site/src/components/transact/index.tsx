import React from 'react';
import styled from 'styled-components/macro';

import ReceiveModal from './modals/ReceiveModal';
import SendModal from './modals/SendModal';
import Arrow from '../utils/Arrow';
import TooltipInfo from '../utils/TooltipInfo';
import Typography from '../utils/Typography';
import FlexColumnWrapper from '../utils/wrappers/FlexColumnWrapper';
import FlexRowWrapper from '../utils/wrappers/FlexRowWrapper';

const TransactWrapper = styled(FlexColumnWrapper)`
  row-gap: 32px;
  background: ${(props) => props.theme.colors.dark?.default};
  box-shadow: 0px 0px 21px 5px #000000;
  color: #dadada;
  padding: 24px;
  overflow-y: auto;
  width: auto;
  z-index: 0;

  border-radius: ${(props) => props.theme.borderRadius};
  .actions-wrapper {
    column-gap: 24px;
    z-index: 0;
    .user-action {
      display: flex;
      flex-direction: column;
      align-items: center;
      border: 1px solid #eeeeee34;
      height: fit-content;
      min-width: 112px;
      padding: 24px;
      row-gap: 4px;
      cursor: pointer;
      border-radius: ${(props) => props.theme.borderRadius};
      transition: all 0.3s;

      &:hover {
        transform: scale(1.1);
        border: 1px solid #fff;
        transition: all 0.3s;
        box-shadow: 0px 0px 21px 5px rgba(0, 0, 0, 1);
      }

      &.coming-soon {
        cursor: disabled !important;
        background: #0e0e0e;
        &:hover {
          transform: unset;
          transition: unset;
          border: 1px solid #eeeeee34;
          background: #000000;
          box-shadow: unset;
          cursor: not-allowed;
        }
      }
    }
    .time-icon {
      height: 34px;
      width: 34px;
      padding: 4px;
    }
  }
`;

const Transact = () => {
  const [isSendModalOpen, setIsSendModalOpen] = React.useState(false);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = React.useState(false);

  return (
    <TransactWrapper>
      <Typography>
        Transact{' '}
        <TooltipInfo
          children={
            <Typography size={14} weight={500}>
              Send/Deposit BTC to a ZetaChain wallet <br />
              or Receive BTC to your created BTC wallet
            </Typography>
          }
        />
      </Typography>
      <FlexRowWrapper className="actions-wrapper">
        <div
          className="user-action send"
          onClick={() => setIsSendModalOpen(true)}
        >
          <Arrow />
          <Typography size={24}>Send</Typography>
        </div>
        <div
          className="user-action"
          onClick={() => setIsReceiveModalOpen(true)}
        >
          <Arrow isReceived={true} />
          <Typography size={24}>Receive</Typography>
        </div>
        <SendModal
          isSendModalOpen={isSendModalOpen}
          setIsSendModalOpen={setIsSendModalOpen}
        />
        <ReceiveModal
          isReceiveModalOpen={isReceiveModalOpen}
          setIsReceiveModalOpen={setIsReceiveModalOpen}
        />
      </FlexRowWrapper>
    </TransactWrapper>
  );
};

export default Transact;
