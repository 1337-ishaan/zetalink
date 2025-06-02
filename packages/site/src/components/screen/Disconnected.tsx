import React, { useContext } from 'react';
import styled from 'styled-components/macro';

import { StoreContext } from '../../hooks/useStore';
import SocialLinks from '../utils/SocialLinks';
import Typography from '../utils/Typography';
import FlexColumnWrapper from '../utils/wrappers/FlexColumnWrapper';
import FlexRowWrapper from '../utils/wrappers/FlexRowWrapper';

const DisconnectedWrapper = styled(FlexRowWrapper)`
  width: 80vw;
  column-gap: 44px;
  z-index: 1;
  justify-content: center;

  .supported-resources {
    width: 50%;
    row-gap: 40px;
  }
`;

type DisconnectedProps = {};

const Disconnected = ({}: DisconnectedProps): JSX.Element => {
  const { globalState, setGlobalState } = useContext(StoreContext);

  React.useEffect(() => {
    setGlobalState({
      ...globalState,
      isMainnet: globalState?.isMainnet ?? false,
    });
  }, []);

  return (
    <DisconnectedWrapper>
      <FlexColumnWrapper className="supported-resources">
        <Typography size={24} weight={300}>
          Welcome to ZetaLink 🎉
          <br />
          <br /> The only Metamask Snap allowing you to bridge native BTC to
          supported ZRC20 asset on ZetaChain, Ethereum, Binance Smart Chain,
          Base, Arbitrum, TON, Sui, Solana, Avalanche & Polygon.
          <br />
          <br />
          <br />
          Learn more about ZetaLink ↓
        </Typography>
        <SocialLinks isFloatingLeft={false} />
      </FlexColumnWrapper>
      <iframe
        width="560"
        height="315"
        src="https://www.youtube.com/embed/xTu6RreLxLQ?si=7aHJuZ27hi5kQWZ_"
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      ></iframe>
      {/* <iframe
        width="560"
        height="400"
        style={{ width: '100%' }}
        src="https://youtu.be/xTu6RreLxLQ"
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; 22gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      ></iframe> */}
    </DisconnectedWrapper>
  );
};

export default Disconnected;
