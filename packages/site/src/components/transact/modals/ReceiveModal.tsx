import { useContext, useState } from 'react';
import Modal from 'react-modal';
import QRCode from 'react-qr-code';
import styled from 'styled-components/macro';

import { ReactComponent as BitcoinIcon } from '../../../assets/bitcoin.svg';
import { ReactComponent as CrossIcon } from '../../../assets/cross.svg';
import { ReactComponent as ZetaChainIcon } from '../../../assets/zetachain.svg';
import { StoreContext } from '../../../hooks/useStore';
import Copyable from '../../utils/Copyable';
import Typography from '../../utils/Typography';
import FlexColumnWrapper from '../../utils/wrappers/FlexColumnWrapper';
import FlexRowWrapper from '../../utils/wrappers/FlexRowWrapper';

const ReceiveModalWrapper = styled.div`
  position: relative;

  .address-type-wrapper {
    justify-content: space-around;
  }
`;

type ReceiveModalProps = {
  isReceiveModalOpen: boolean;
  setIsReceiveModalOpen: (isOpen: boolean) => void;
};

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    padding: 0,
    background: 'transparent',
    border: 'none',
  },
};

const ReceiveModal = ({
  isReceiveModalOpen,
  setIsReceiveModalOpen,
}: ReceiveModalProps): JSX.Element => {
  const { globalState } = useContext(StoreContext);
  const [selectedAddressType, setSelectedAddressType] = useState<
    'BTC' | 'ZETA'
  >('BTC');

  const handleCloseModal = () => {
    setIsReceiveModalOpen(false);
  };

  return (
    <ReceiveModalWrapper>
      {globalState?.btcAddress && (
        <Modal style={customStyles} isOpen={isReceiveModalOpen}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              rowGap: '16px',
              position: 'relative',
              justifyContent: 'center',
              alignItems: 'center',
              background: '#141417',
              padding: '16px',
              width: '400px',
              transition: '.5s all',
            }}
          >
            <FlexRowWrapper
              style={{
                justifyContent: 'space-evenly',
                alignItems: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                paddingBottom: '12px',
              }}
              className="address-type-wrapper"
            >
              <FlexColumnWrapper onClick={() => setSelectedAddressType('ZETA')}>
                <Typography
                  className="type-button"
                  color={selectedAddressType === 'ZETA' ? '#fff' : '#a49f9f'}
                  size={16}
                >
                  ZETA <ZetaChainIcon />
                </Typography>
              </FlexColumnWrapper>
              <div
                style={{
                  height: '24px',
                  width: '.1px',
                  background: 'rgba(255,255,255,0.4)',
                }}
              />
              <FlexColumnWrapper onClick={() => setSelectedAddressType('BTC')}>
                <Typography
                  className="type-button"
                  color={selectedAddressType === 'BTC' ? '#fff' : '#a49f9f'}
                  size={16}
                >
                  BTC <BitcoinIcon />
                </Typography>
              </FlexColumnWrapper>
            </FlexRowWrapper>

            <CrossIcon
              onClick={handleCloseModal}
              style={{
                color: '#fff',
                cursor: 'pointer',
                position: 'absolute',
                top: 20,
                height: '16px',
                width: '16px',
                right: 20,
              }}
            />
            <Typography color="#fff" size={24}>
              Receive {selectedAddressType === 'BTC' ? 'BTC' : 'ZETA'}
            </Typography>
            <QRCode
              style={{ border: '4px solid #fff' }}
              value={
                selectedAddressType === 'BTC'
                  ? globalState?.btcAddress
                  : globalState?.evmAddress!
              }
            />
            <Copyable>
              {selectedAddressType === 'BTC'
                ? globalState?.btcAddress
                : globalState?.evmAddress!}
            </Copyable>
          </div>
        </Modal>
      )}
    </ReceiveModalWrapper>
  );
};

export default ReceiveModal;
