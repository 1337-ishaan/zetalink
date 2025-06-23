import { ethers } from 'ethers';
import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components/macro';

import { ReactComponent as BitcoinLogo } from '../../assets/bitcoin.svg';
import { ReactComponent as DisconnectIcon } from '../../assets/disconnect.svg';
import { ReactComponent as Logo } from '../../assets/logo.svg';
import { ReactComponent as ZetaLogo } from '../../assets/zetachain.svg';
import { MetaMaskContext } from '../../hooks';
import { StoreContext } from '../../hooks/useStore';
import {
  connectSnap,
  createBtcWallet,
  disconnectSnap,
  setLocalStorage,
} from '../../utils';
import Copyable from '../utils/Copyable';
import StyledButton from '../utils/StyledButton';
import Toggle from '../utils/Toggle';
import Typography from '../utils/Typography';
import FlexRowWrapper from '../utils/wrappers/FlexRowWrapper';

const HeaderWrapper = styled(FlexRowWrapper)`
  justify-content: space-between;
  padding: 32px 0;

  .logo {
    height: 48px;
    width: 48px;
  }
  .address-header {
    align-items: center;
    column-gap: 24px;
    height: fit-content;
  }
  .icon-addr-wrapper {
    position: relative;
    .chain-icon {
      position: absolute;
      top: -4px;
      left: -12px;
      width:24px;
      height:24px;
      transform: scale(1.4);
      opacity: 0.3;
      transition: opacity 0.3s ease;
    }
  }
  .icon-addr-wrapper {
    transition: opacity 0.3s ease;
  }

  .icon-addr-wrapper:hover .chain-icon {
    opacity: .7;
    }
  }
    .disconnect-btn-wrapper{
      background:transparent;
      .disconnect-icon {
        width: 24px;
        height: 24px;
        color:#bfbfbf;
        transition: color 0.3s all;
        &:hover{
          transition: color 0.3s all;
          fill:#fff;
        }
      }
      &:hover{
        border:none;
      }
    }

    .header-section-disconnected{
        column-gap:16px;
    }

    .logo-wrapper{
    position:relative;

    .t-current-network{
      position:absolute;
      top:6px;
      right:-44px;
      background-color: rgba(255,255,0,1);
      border:1px solid #000;
      border-radius: 20px;
      padding:2px 4px ;
      color:#000;
     }
    }
     .faucet-btn-wrapper{
     display:flex;
     column-gap:8px;
     align-items:center;
     &:hover{
      // transform: none;
      // outline:none;
     }
     }
  `;

type HeaderProps = {};

const Header = ({}: HeaderProps): JSX.Element => {
  const [state] = useContext(MetaMaskContext);
  const { globalState, setGlobalState } = useContext(StoreContext);
  const [isSnapInstalled, setIsSnapInstalled] = useState(false);

  useEffect(() => {
    // Save the global state to localStorage when it changes
    if (globalState?.evmAddress && globalState?.btcAddress) {
      setLocalStorage('zeta-snap', JSON.stringify(globalState));
    }
  }, [globalState]);

  // Get EVM address
  const getEvmAddress = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum as any);
    const connectedAddress = await provider.getSigner();
    return connectedAddress.address;
  };

  // Connect to the Zeta snap
  const onConnectSnap = async (isMainnet: boolean) => {
    // console\.log\(.*?\);+?
    try {
      await connectSnap();
      setIsSnapInstalled(true);

      if (typeof isMainnet !== 'undefined') {
        const evmAddress = await getEvmAddress();
        const btcAddress = await createBtcWallet(isMainnet);
        if (evmAddress && btcAddress) {
          setGlobalState({ ...globalState, btcAddress, evmAddress });
        }
      }
    } catch (e) {
      setIsSnapInstalled(false);
      console.error('Error connecting to Zeta snap:', e);
    }
  };

  // useEffect(() => {
  //   setIsSnapInstalled(!!state.installedSnap);
  // }, [state]);

  // Disconnect from the Zeta snap
  const onDisconnectSnap = async () => {
    try {
      setGlobalState({});
      await disconnectSnap();
      localStorage.removeItem('zeta-snap');
    } catch (e) {
      console.error('Error disconnecting from Zeta snap:', e);
    }
  };

  return (
    <HeaderWrapper>
      <div className="logo-wrapper">
        <Logo className="logo" />
        <Typography size={9} weight={800} className="t-current-network">
          {globalState?.isMainnet ? 'mainnet' : 'testnet'}
        </Typography>
      </div>
      <div className="connect-wallet-wrapper">
        {/* {isSnapInstalled || state.installedSnap ? ( */}
        <FlexRowWrapper>
          {!globalState?.btcAddress ? (
            <FlexRowWrapper className="header-section-disconnected">
              <Toggle
                isMainnet={globalState?.isMainnet}
                onToggle={(option) =>
                  setGlobalState({ ...globalState, isMainnet: option })
                }
              />
              <StyledButton
                onClick={async () => onConnectSnap(globalState?.isMainnet)}
              >
                {!state.installedSnap ? 'Install' : 'Connect'} ZetaLink
              </StyledButton>
            </FlexRowWrapper>
          ) : (
            <FlexRowWrapper className="address-header">
              <div className="icon-addr-wrapper">
                <BitcoinLogo className="chain-icon" />
                <Copyable>{globalState?.btcAddress}</Copyable>
              </div>

              <div className="icon-addr-wrapper">
                <ZetaLogo className="chain-icon" />
                <Copyable>{globalState?.evmAddress}</Copyable>
              </div>

              {!globalState.isMainnet ? (
                <StyledButton
                  className="faucet-btn-wrapper"
                  onClick={() =>
                    window.open(
                      'https://docs.zetalink.xyz/requesting-funds-from-faucet-testnet',
                      '_blank',
                    )
                  }
                >
                  Faucet <BitcoinLogo className="faucet-icon" />
                </StyledButton>
              ) : (
                <></>
              )}

              <StyledButton
                className="disconnect-btn-wrapper"
                onClick={onDisconnectSnap}
              >
                <DisconnectIcon className="disconnect-icon" />
              </StyledButton>
            </FlexRowWrapper>
          )}
        </FlexRowWrapper>
        {/* ) : (
          <StyledButton onClick={() => onConnectSnap(false)}>
            Install & Connect ZetaLink
          </StyledButton>
        )} */}
      </div>
    </HeaderWrapper>
  );
};

export default Header;
