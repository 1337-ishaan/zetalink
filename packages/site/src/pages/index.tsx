import { useContext } from 'react';
import styled from 'styled-components/macro';

import { ReactComponent as Logo } from '../assets/logo.svg';
import Balances from '../components/balances/Balances';
import Header from '../components/header/Header';
import Disconnected from '../components/screen/Disconnected';
import Transact from '../components/transact';
import TrxHistory from '../components/transaction-history/TrxHistory';
import SocialLinks from '../components/utils/SocialLinks';
import FlexColumnWrapper from '../components/utils/wrappers/FlexColumnWrapper';
import FlexRowWrapper from '../components/utils/wrappers/FlexRowWrapper';
import { defaultSnapOrigin } from '../config';
import { MetaMaskContext } from '../hooks';
import { StoreContext } from '../hooks/useStore';
import { isLocalSnap } from '../utils';

const AppWrapper = styled(FlexColumnWrapper)`
  padding: 16px 32px;
  margin: 0 auto;
  .action-balances-wrapper {
    column-gap: 24px;
  }
 

  @keyframes animateDropShadow {
    0% { filter: drop-shadow(0 0 160px #676767); }
    50% { filter: drop-shadow(0 0 10px #676767); }
    100% { filter: drop-shadow(0 0 160px #676767); }
  }
    .page-bg-logo {
      position: absolute;
      width: 720px;
      top: 0;
      left: 0;
      opacity: 0.1;
      z-index: 0;
      animation: animateDropShadow 4s infinite;
   
    }
  }

  .trx-transact-wrapper {
    row-gap: 24px;
  }
`;

const Index = () => {
  const [state] = useContext(MetaMaskContext);
  const { globalState } = useContext(StoreContext);

  const isMetaMaskReady = isLocalSnap(defaultSnapOrigin)
    ? state.isFlask
    : state.installedSnap;

  const isBtcAddressPresent = Boolean(globalState?.btcAddress);
  return (
    <AppWrapper
      style={{
        // justifyContent: isBtcAddressPresent ? 'space-evenly' : 'center',
        rowGap: isBtcAddressPresent ? 'unset' : '15vh',
        // justifyContent: isBtcAddressPresent ? 'space-evenly' : 'center',
      }}
    >
      <Logo className="page-bg-logo" />
      <Header />
      {globalState?.btcAddress ? (
        <FlexRowWrapper className="action-balances-wrapper">
          <FlexColumnWrapper className="trx-transact-wrapper">
            <SocialLinks />
            <Transact />
            <TrxHistory />
          </FlexColumnWrapper>
          <Balances />
        </FlexRowWrapper>
      ) : (
        <Disconnected />
      )}
    </AppWrapper>
  );
};

export default Index;
